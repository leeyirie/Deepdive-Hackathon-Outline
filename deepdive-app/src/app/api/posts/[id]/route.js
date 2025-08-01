import { NextResponse } from 'next/server'

// Dynamic route configuration
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' }, 
        { status: 400 }
      )
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' }, 
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching post detail for ID: ${id}, User: ${userId}`)

    // 백엔드 API 호출 - 개별 게시글 상세 정보
    const backendResponse = await fetch(`${process.env.API_BASE_URL || 'http://13.124.229.252:8080'}/posts/${id}?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`📡 Backend response status: ${backendResponse.status}`)
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ Post detail data fetched successfully:', data)
      return NextResponse.json(data)
    } else {
      const errorText = await backendResponse.text()
      console.error('❌ Backend error:', errorText)
      
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { error: 'Post not found' }, 
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch post detail' }, 
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    console.error('❌ Post detail API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}