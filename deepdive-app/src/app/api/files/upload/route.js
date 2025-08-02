import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    // FormData를 그대로 백엔드로 전달
    const formData = await request.formData()
    
    console.log('📤 파일 업로드 프록시 요청')
    
    // 백엔드 API 호출
    const backendResponse = await fetch('https://13.124.229.252:8080/files/upload', {
      method: 'POST',
      body: formData // FormData를 그대로 전달
    })
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      console.log('✅ 파일 업로드 성공:', data)
      console.log('📝 반환된 데이터 타입:', typeof data)
      console.log('📝 반환된 데이터 구조:', Array.isArray(data) ? '배열' : '객체')
      console.log('📝 반환된 URL 예시:', Array.isArray(data) && data.length > 0 ? data[0] : 'URL 없음')
      
      // 백엔드에서 반환한 상대 경로를 프론트엔드 프록시 URL로 변환
      let processedData = data
      if (Array.isArray(data)) {
        processedData = data.map(url => {
          console.log('📤 파일 업로드 URL 처리:', url)
          
          // 이미 프록시 URL인 경우 그대로 반환 (중복 변환 방지)
          if (url && url.startsWith('/api/uploads/')) {
            console.log('✅ 이미 프록시 URL:', url)
            return url
          }
          
          // /uploads/filename.jpg -> /api/uploads/filename.jpg
          if (url && url.startsWith('/uploads/')) {
            const proxyUrl = `/api${url}`
            console.log('🔄 프록시 URL로 변환:', url, '->', proxyUrl)
            return proxyUrl
          }
          
          console.log('❓ 알 수 없는 URL 형태:', url)
          return url
        })
      } else if (typeof data === 'string') {
        console.log('📤 파일 업로드 문자열 데이터 처리:', data)
        
        // 이미 프록시 URL인 경우 그대로 반환
        if (data.startsWith('/api/uploads/')) {
          console.log('✅ 이미 프록시 URL:', data)
          processedData = data
        } else if (data.startsWith('/uploads/')) {
          const proxyUrl = `/api${data}`
          console.log('🔄 프록시 URL로 변환:', data, '->', proxyUrl)
          processedData = proxyUrl
        }
      }
      
      console.log('📝 프록시 URL로 변환된 데이터:', processedData)
      
      return NextResponse.json(processedData)
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