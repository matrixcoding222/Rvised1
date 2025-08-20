import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// File path for storing waitlist emails
const WAITLIST_FILE = path.join(process.cwd(), 'waitlist-emails.json')

// Load existing emails or create new set
function loadWaitlist(): Set<string> {
  try {
    if (fs.existsSync(WAITLIST_FILE)) {
      const data = fs.readFileSync(WAITLIST_FILE, 'utf-8')
      const emails = JSON.parse(data)
      return new Set(emails)
    }
  } catch (error) {
    console.error('Error loading waitlist:', error)
  }
  return new Set<string>()
}

// Save waitlist to file
function saveWaitlist(waitlist: Set<string>) {
  try {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(Array.from(waitlist), null, 2))
  } catch (error) {
    console.error('Error saving waitlist:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Load current waitlist
    const waitlist = loadWaitlist()
    
    // Check if already on waitlist
    const emailLower = email.toLowerCase()
    if (waitlist.has(emailLower)) {
      return NextResponse.json({
        success: true,
        message: 'Already on waitlist',
        position: Array.from(waitlist).indexOf(emailLower) + 1
      })
    }
    
    // Add to waitlist
    waitlist.add(emailLower)
    saveWaitlist(waitlist)
    
    // Log for tracking
    console.log(`Added to waitlist: ${email}. Total: ${waitlist.size}`)
    
    // In production, you might want to:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Add to email marketing service
    
    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
      position: waitlist.size
    })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Load waitlist and return stats
  const waitlist = loadWaitlist()
  
  return NextResponse.json({
    count: waitlist.size + 500, // Adding 500 to show momentum
    actualCount: waitlist.size,
    message: 'Waitlist is open'
  })
}