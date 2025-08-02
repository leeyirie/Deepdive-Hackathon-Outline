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
    console.log('📤 제보 등록 요청 데이터 타입:', typeof body)
    console.log('📤 제보 등록 요청 데이터 키:', Object.keys(body))

    // 필수 필드 검증
    const { userId, title, content, imageUrl, locationCode, regionName, latitude, longitude, status } = body

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: 'userId, title, content are required' },
        { status: 400 }
      )
    }

    // 백엔드로 보낼 데이터 구성
    const backendData = {
      userId: parseInt(userId),
      title: title.trim(),
      content: content.trim(),
      imageUrl: Array.isArray(imageUrl) ? imageUrl : (imageUrl ? [imageUrl] : []),
      locationCode: locationCode || '',
      regionName: regionName || '',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      status: status || 0
    }
    
    console.log('📤 백엔드로 보낼 데이터:', backendData)
    console.log('📤 백엔드 URL:', `${process.env.API_BASE_URL || 'http://13.124.229.252:8080'}/posts`)

    // 백엔드 API 호출
    const apiUrl = `${process.env.API_BASE_URL || 'http://13.124.229.252:8080'}/posts`
    console.log('🌐 백엔드 API URL:', apiUrl)
    console.log('📤 백엔드로 보낼 JSON:', JSON.stringify(backendData, null, 2))
    
    const backendResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData)
    })

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ 제보 등록 성공:', data)
      return NextResponse.json(data)
    } else {
      const errorText = await backendResponse.text()
      console.error('❌ 백엔드 제보 등록 실패:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorText,
        url: backendResponse.url
      })
      return NextResponse.json(
        { error: `Failed to create post: ${backendResponse.status} - ${errorText}` },
        { status: backendResponse.status }
      )
    }
  } catch (error) {
    console.error('❌ 제보 등록 API 오류:', error)
    console.error('❌ 제보 등록 API 오류 스택:', error.stack)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}