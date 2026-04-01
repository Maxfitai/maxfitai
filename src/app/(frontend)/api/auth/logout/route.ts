import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Custom logout endpoint for frontend users
  // This doesn't clear any cookies since we use localStorage
  // It just returns success - the frontend clears localStorage

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}
