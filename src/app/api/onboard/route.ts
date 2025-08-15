import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the received data
    console.log('Received form data:', body)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data: body,
      timestamp: new Date().toISOString()
    }, { status: 201 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Invalid request data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}