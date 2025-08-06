# Rvised - Complete Project Context File

## Project Vision & Goals

**Mission**: Transform YouTube's endless hours into actionable knowledge in minutes, making learning efficient for busy professionals and students.

**Vision Statement**: Become the go-to YouTube summarization tool by offering premium quality at half the competitor's price with a delightfully minimal interface.

### Primary Goals
- Launch MVP with 100 paying users in month 1
- Achieve product-market fit with <$0.05 cost per summary
- Build sustainable solo business generating $5k MRR by month 6

### Learning Goals
- Master React component architecture
- Understand full-stack development with Next.js
- Learn production deployment and monitoring
- Build and scale a Chrome extension

## User Personas & Journeys

### Primary Persona: Sarah the Developer
**Demographics**: 26, full-stack developer, watches 10+ tutorials weekly
**Pain Points**: 
- Wastes 2+ hours daily on YouTube at 2x speed
- Messy handwritten notes across notebooks
- Can't remember which video had that one solution

**User Journey**:
1. Discovers Rvised via dev Twitter/Reddit
2. Installs Chrome extension (< 30 seconds)
3. Clicks "Summarize" on first tutorial
4. Sees clean summary in 5 seconds → "Wow!"
5. Saves to "React Learning" project folder
6. Upgrades to Pro after hitting daily limit
7. Evangelizes to dev friends

**Success Metric**: Uses Rvised for 80% of technical videos

### Secondary Persona: Mike the Student  
**Demographics**: 21, CS major, budget-conscious
**Pain Points**:
- Professor's lectures are on YouTube
- Can't afford multiple subscriptions
- Needs quick review before exams

**User Journey**:
1. Finds Rvised through classmate
2. Uses free tier for lecture summaries
3. Creates "CS 350" project folder
4. Reviews all summaries before midterm
5. Aces exam → becomes loyal user
6. Upgrades during finals week

## Feature Specifications

### 1. YouTube Video Summarization
**What**: Paste URL or click extension → Get summary
**Technical**:
- Extract transcript via YouTube API
- Process with GPT-4 (max 3000 tokens)
- Return structured summary + key points
**Success Criteria**:
- < 5 second generation time
- 95% user satisfaction rating
- Works on 99% of public videos

### 2. Chrome Extension
**What**: Seamless YouTube integration
**Technical**:
- Manifest V3 architecture
- Inject "Summarize" button on video pages
- Share auth with main app
- Local caching for recent summaries
**Success Criteria**:
- < 1 second load time
- 4.5+ Chrome store rating
- Zero permission warnings

### 3. Summary Library & Projects
**What**: Personal knowledge management
**Technical**:
- Supabase for data persistence
- Folder-based organization
- Full-text search
- Drag-and-drop interface
**Success Criteria**:
- Instant search results
- Unlimited folders/summaries
- Works offline (cached data)

### 4. Subscription Management
**Tiers**:
- Free: 5 summaries/day
- Pro: $4.99/month unlimited
**Technical**:
- Stripe Checkout (not Elements)
- Webhook handling for status
- Grace period for failed payments
**Success Criteria**:
- < 2% payment failures
- 10% free-to-paid conversion
- Cancel anytime, data retained 30 days

## Technical Architecture

### Stack Decisions
```
Frontend: React 18 + Tailwind CSS
Backend: Next.js 14 (App Router)
Database: Supabase (PostgreSQL)
Auth: Supabase Auth (Google OAuth)
Payments: Stripe Checkout
AI: OpenAI GPT-4-turbo
Deployment: Vercel
Monitoring: Vercel Analytics
```

### API Design
```
POST /api/summarize
- Input: { videoUrl: string }
- Output: { summary: string, keyPoints: string[], videoTitle: string }

GET /api/summaries
- Auth required
- Returns user's summaries with pagination

POST /api/projects
- Create/update project folders

POST /api/webhook/stripe
- Handle subscription events
```

### Database Schema
```sql
-- Handled by Supabase Auth
users (id, email, created_at)

-- Our tables
summaries (
  id, user_id, video_url, video_title, 
  summary_text, key_points[], 
  created_at, updated_at
)

projects (
  id, user_id, name, color, 
  created_at, updated_at  
)

summary_projects (
  summary_id, project_id
)

user_subscriptions (
  user_id, stripe_customer_id, 
  status, current_period_end
)
```

## Development Workflow

### Phase 1: Foundation (Days 1-3)
- [ ] Next.js setup with TypeScript
- [ ] Supabase integration
- [ ] Basic UI components
- [ ] YouTube transcript fetching
- [ ] OpenAI integration
- [ ] Deploy to Vercel

### Phase 2: Core Features (Days 4-7)
- [ ] Summary generation flow
- [ ] User authentication
- [ ] Summary library UI
- [ ] Project folders
- [ ] Chrome extension MVP

### Phase 3: Monetization (Days 8-10)
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Usage limits
- [ ] Payment webhooks

### Phase 4: Polish & Launch (Days 11-14)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Marketing site
- [ ] Launch on Product Hunt

## Quality Standards

### Code Quality
- Components < 150 lines
- Functions do ONE thing
- Error boundaries on all API calls
- TypeScript for type safety
- Comments explain "why" not "what"

### User Experience  
- Every action < 300ms feedback
- Loading skeletons, not spinners
- Friendly error messages
- Mobile-first responsive
- Keyboard accessible

### Performance
- Lighthouse score > 90
- Summary generation < 5 seconds
- Bundle size < 200KB initial JS
- Works on 3G connections

### Business Metrics
- CAC < $10 per paid user
- Churn < 5% monthly
- NPS > 50
- Support tickets < 5% of users

## Competitive Advantages

**vs Eightify ($9.99/mo)**:
- 50% cheaper at $4.99
- Cleaner, minimal UI
- Project organization unique feature
- More generous free tier

**Our Moat**:
- Superior UX design
- Aggressive pricing
- Fast iteration cycles
- Direct user feedback loop

## Risk Mitigation

### Technical Risks
- **YouTube API changes**: Fallback scraping methods ready
- **OpenAI costs**: Smart caching, prompt optimization
- **Scale issues**: Vercel auto-scaling, Supabase handles load

### Business Risks  
- **Eightify price cut**: We can go to $2.99 if needed
- **YouTube blocks**: Position as "research tool"
- **Low conversion**: A/B test everything

## What We're NOT Building
- Mobile apps (web-first)
- AI chat interface  
- Social features
- Dark mode
- Video downloads
- Multiple languages (English only for MVP)
- Custom AI models

---

**This context file is the single source of truth. When in doubt, refer here.**