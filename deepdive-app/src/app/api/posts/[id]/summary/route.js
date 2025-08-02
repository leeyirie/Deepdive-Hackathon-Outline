import { NextResponse } from 'next/server'

// Dynamic route configuration
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' }, 
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching AI summary for post ID: ${id}`)

    // 백엔드 API 호출 - AI 요약 조회
    const backendResponse = await fetch(`${process.env.API_BASE_URL || 'http://13.124.229.252:8080'}/posts/${id}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`📡 Backend summary response status: ${backendResponse.status}`)
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ AI summary fetched successfully:', data)
      return NextResponse.json(data)
    } else {
      const errorText = await backendResponse.text()
      console.error('❌ Backend summary error:', errorText)
      
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { error: 'AI summary not found' }, 
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch AI summary' }, 
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    console.error('❌ AI summary API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 