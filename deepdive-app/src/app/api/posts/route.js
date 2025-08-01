import { NextResponse } from 'next/server'

// Dynamic route configuration
export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const sort = url.searchParams.get('sort') || 'latest'
    const search = url.searchParams.get('search') || ''
    const bigCategory = url.searchParams.get('bigCategory') || ''
    const smallCategory = url.searchParams.get('smallCategory') || ''

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' }, 
        { status: 400 }
      )
    }

    // 백엔드 API 호출
    const queryParams = new URLSearchParams({
      userId,
      sort,
      ...(search && { search }),
      ...(bigCategory && { bigCategory }),
      ...(smallCategory && { smallCategory })
    })

    const backendResponse = await fetch(`${process.env.API_BASE_URL || 'http://13.124.229.252:8080'}/posts?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch posts' }, 
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    console.error('Posts API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}