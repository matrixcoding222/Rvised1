import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WAITLIST_FILE = path.join(process.cwd(), 'waitlist-emails.json')

export async function GET(request: NextRequest) {
  try {
    // Check for admin secret (add to your .env.local)
    const authHeader = request.headers.get('authorization')
    const adminSecret = process.env.WAITLIST_ADMIN_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Load waitlist emails
    if (!fs.existsSync(WAITLIST_FILE)) {
      return NextResponse.json({ emails: [], count: 0 })
    }
    
    const data = fs.readFileSync(WAITLIST_FILE, 'utf-8')
    const emails = JSON.parse(data)
    
    // Return as CSV format for easy export
    const format = request.nextUrl.searchParams.get('format')
    
    if (format === 'csv') {
      const csv = emails.join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="waitlist-emails.csv"'
        }
      })
    }
    
    return NextResponse.json({
      emails,
      count: emails.length,
      exportUrl: '/api/waitlist/export?format=csv'
    })
    
  } catch (error) {
    console.error('Error exporting waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to export waitlist' },
      { status: 500 }
    )
  }
}