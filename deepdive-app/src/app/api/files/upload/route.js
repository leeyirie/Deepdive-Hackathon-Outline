import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    // FormData를 그대로 백엔드로 전달
    const formData = await request.formData()
    
    console.log('📤 파일 업로드 프록시 요청')
    
    // 백엔드 API 호출
    const backendResponse = await fetch('http://13.124.229.252:8080/files/upload', {
      method: 'POST',
      body: formData // FormData를 그대로 전달
    })
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ 파일 업로드 성공:', data)
      console.log('📝 반환된 데이터 타입:', typeof data)
      console.log('📝 반환된 데이터 구조:', Array.isArray(data) ? '배열' : '객체')
      console.log('📝 반환된 URL 예시:', Array.isArray(data) && data.length > 0 ? data[0] : 'URL 없음')
      
      // 백엔드에서 반환한 상대 경로를 그대로 사용 (백엔드에서 처리)
      console.log('📝 백엔드에서 반환한 URL들:', data)
      
      return NextResponse.json(data)
    } else {
      const errorText = await backendResponse.text()
      console.error('❌ 파일 업로드 실패:', backendResponse.status, errorText)
      return NextResponse.json(
        { error: 'File upload failed' },
        { status: backendResponse.status }
      )
    }
    
  } catch (error) {
    console.error('❌ 파일 업로드 프록시 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 