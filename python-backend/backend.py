from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import re
import json
import time
from typing import List, Dict, Any, Optional
import requests

app = Flask(__name__)
CORS(app)


def extract_video_id(value: str) -> Optional[str]:
    if not value:
        return None
    # raw id
    if len(value) >= 8 and len(value) <= 15 and all(c.isalnum() or c in ['-', '_'] for c in value):
        return value
    # from url
    m = re.search(r'(?:watch\?v=|youtu\.be/|embed/)([^&\n?#]+)', value)
    return m.group(1) if m else None


def _build_from_events(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    segs: List[Dict[str, Any]] = []
    for ev in events or []:
        text = ''.join((s.get('utf8') or '') for s in ev.get('segs') or []).strip()
        if not text:
            continue
        start = float(ev.get('tStartMs', 0)) / 1000.0
        dur = float(ev.get('dDurationMs', 0)) / 1000.0
        segs.append({ 'text': text, 'start': start, 'duration': dur })
    return {
        'text': ' '.join(s['text'] for s in segs if s['text']).strip(),
        'segments': segs
    }


def _http_get_json(url: str, timeout: float = 8.0) -> Optional[Dict[str, Any]]:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
    r = requests.get(url, headers=headers, timeout=timeout)
    if not r.ok:
        return None
    try:
        return r.json()
    except Exception:
        return None


def _http_get_text(url: str, timeout: float = 8.0) -> Optional[str]:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
    r = requests.get(url, headers=headers, timeout=timeout)
    if not r.ok:
        return None
    return r.text


def fallback_timedtext(vid: str) -> Optional[Dict[str, Any]]:
    # 1) List available languages
    langs_xml = _http_get_text(f'https://video.google.com/timedtext?type=list&v={vid}')
    langs: List[str] = []
    if langs_xml:
        langs = [m.group(1) for m in re.finditer(r'lang_code="([^"]+)"', langs_xml)]
    # Prioritize English variants
    preferred = [l for l in langs if l.lower().startswith('en')]
    others = [l for l in langs if not l.lower().startswith('en')]
    language_order = preferred + others
    if not language_order:
        # Try common English codes even if list failed
        language_order = ['en', 'en-US', 'en-GB']

    def try_urls(lang: Optional[str]) -> Optional[Dict[str, Any]]:
        candidates: List[str] = []
        base_google = f'https://video.google.com/timedtext?v={vid}'
        base_youtube = f'https://www.youtube.com/api/timedtext?v={vid}'
        if lang:
            candidates.append(f'{base_google}&lang={lang}&fmt=json3')
            candidates.append(f'{base_google}&lang={lang}&fmt=json3&kind=asr')
            candidates.append(f'{base_youtube}&lang={lang}&fmt=json3')
            candidates.append(f'{base_youtube}&lang={lang}&fmt=json3&kind=asr')
        candidates.append(f'{base_google}&fmt=json3&kind=asr&caps=asr')
        candidates.append(f'{base_youtube}&fmt=json3&kind=asr&caps=asr')

        for url in candidates:
            # small retry loop for transient 429
            for _ in range(3):
                j = _http_get_json(url)
                if j and isinstance(j, dict) and isinstance(j.get('events'), list) and j['events']:
                    built = _build_from_events(j['events'])
                    if built['text'] and len(built['text']) > 20:
                        return built
                time.sleep(0.35)
        return None

    # Try with languages first
    for l in language_order:
        out = try_urls(l)
        if out:
            return out
        time.sleep(0.25)

    # Final language-agnostic ASR
    return try_urls(None)


@app.route('/get-transcript', methods=['GET', 'POST'])
def get_transcript():
    try:
        if request.method == 'GET':
            raw_id = request.args.get('videoId') or request.args.get('videoUrl') or ''
        else:
            data = request.get_json(force=True, silent=True) or {}
            raw_id = data.get('videoId') or data.get('videoUrl') or ''
        vid = extract_video_id(raw_id)
        if not vid:
            return jsonify({ 'success': False, 'error': 'Missing videoId' }), 400

        # Try human captions first; if not available, allow auto-generated (languages fallback)
        segments = None
        try:
            segments = YouTubeTranscriptApi.get_transcript(vid, languages=['en', 'en-US', 'en-GB'])
        except (NoTranscriptFound, TranscriptsDisabled, Exception):
            # Try generated transcripts via library
            try:
                segments = YouTubeTranscriptApi.list_transcripts(vid).find_transcript(['en']).fetch()
            except Exception:
                try:
                    segments = YouTubeTranscriptApi.list_transcripts(vid).find_generated_transcript(['en']).fetch()
                except Exception:
                    segments = None

        if segments:
            text = ' '.join(s.get('text', '').strip() for s in segments if s.get('text'))
            if text and len(text) > 20:
                return jsonify({ 'success': True, 'transcript': text, 'segments': segments })

        # Library failed or rate limited → fallback to video.google.com endpoints directly
        fb = fallback_timedtext(vid)
        if fb and fb.get('text'):
            return jsonify({ 'success': True, 'transcript': fb['text'], 'segments': fb['segments'] })

        return jsonify({ 'success': False, 'error': 'Transcript unavailable' }), 404
    except Exception as e:
        return jsonify({ 'success': False, 'error': str(e) }), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({ 'ok': True })


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)


