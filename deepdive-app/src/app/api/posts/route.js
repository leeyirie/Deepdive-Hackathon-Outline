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
      console.log('📋 Posts list data sample:', data?.slice(0, 2)?.map(post => ({
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        createdAtParsed: new Date(post.createdAt),
        timeDiff: new Date().getTime() - new Date(post.createdAt).getTime()
      })))
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

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📤 제보 등록 요청 데이터:', body)

    // 필수 필드 검증
    const { userId, title, content, imageUrl, locationCode, latitude, longitude, status, createdAt } = body

    if (!userId || !title || !content || !locationCode) {
      return NextResponse.json(
        { error: 'userId, title, content, locationCode are required' },
        { status: 400 }
      )
    }

    // 백엔드 API 호출
    const backendResponse = await fetch(`${process.env.API_BASE_URL || 'http://13.124.229.252:8080'}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: parseInt(userId),
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl || '',
        locationCode: locationCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: status || 0,
        createdAt: createdAt || new Date().toISOString() // 시간이 없으면 현재 시간 사용
      })
    })

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ 제보 등록 성공:', data)
      return NextResponse.json(data)
    } else {
      const errorText = await backendResponse.text()
      console.error('❌ 백엔드 제보 등록 실패:', {
        status: backendResponse.status,
        error: errorText
      })
      return NextResponse.json(
        { error: `Failed to create post: ${backendResponse.status}` },
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    console.error('❌ 제보 등록 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}