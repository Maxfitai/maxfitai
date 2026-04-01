import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Simply return success - actual logout happens on client side
  return NextResponse.json({ success: true })
}
