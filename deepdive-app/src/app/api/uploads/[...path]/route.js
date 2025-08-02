import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { path } = params
    const filePath = path.join('/')
    
    console.log('📁 파일 요청:', filePath)
    
    // 백엔드 서버에서 파일 가져오기
    const backendUrl = `${process.env.API_BASE_URL || 'http://13.124.229.252:8080'}/uploads/${filePath}`
    console.log('🔗 백엔드 파일 URL:', backendUrl)
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
    })
    
    if (backendResponse.ok) {
      const fileBuffer = await backendResponse.arrayBuffer()
      const contentType = backendResponse.headers.get('content-type') || 'application/octet-stream'
      
      console.log('✅ 파일 프록시 성공:', filePath, contentType)
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // 1년 캐시
        },
      })
    } else {
      console.error('❌ 파일 프록시 실패:', backendResponse.status, filePath)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
  } catch (error) {
    console.error('❌ 파일 프록시 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 