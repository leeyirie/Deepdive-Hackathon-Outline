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

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('📤 제보 등록 요청 데이터:', body)

    // 필수 필드 검증
    const { userId, title, content, imageURL, locationCode, latitude, longitude, status } = body

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
        imageURL: imageURL || '',
        locationCode: locationCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: status || 0
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