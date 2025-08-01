import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    
    // 백엔드 API 호출
    const backendResponse = await fetch('http://13.124.229.252:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: 'Login failed' }, 
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}