import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to validate individual features work
export async function GET() {
  const testCases = [
    {
      name: "Emojis ON + Timestamps ON",
      settings: {
        learningMode: 'student',
        summaryDepth: 'quick',
        includeEmojis: true,
        includeCode: false,
        includeQuiz: false,
        includeTimestamps: true
      }
    },
    {
      name: "ALL Features ON",
      settings: {
        learningMode: 'build',
        summaryDepth: 'standard',
        includeEmojis: true,
        includeCode: true,
        includeQuiz: true,
        includeTimestamps: true
      }
    },
    {
      name: "ALL Features OFF",
      settings: {
        learningMode: 'understand',
        summaryDepth: 'deep',
        includeEmojis: false,
        includeCode: false,
        includeQuiz: false,
        includeTimestamps: false
      }
    }
  ]

  return NextResponse.json({
    message: "Feature test cases for debugging",
    testCases,
    instructions: "Use these settings combinations to test if features toggle properly"
  })
}
