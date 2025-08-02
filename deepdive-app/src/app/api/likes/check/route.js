export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const postId = searchParams.get('postId')
    
    console.log('🔍 공감해요 여부 확인 요청:', { userId, postId })
    
    if (!userId || !postId) {
      return Response.json(
        { error: 'userId and postId are required' },
        { status: 400 }
      )
    }
    
    // 백엔드 API 호출
    const backendUrl = `http://13.124.229.252:8080/likes/check?userId=${userId}&postId=${postId}`
    console.log('🔍 Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const isLiked = await response.json()
      console.log('✅ 공감해요 여부 확인 결과:', isLiked)
      return Response.json(isLiked)
    } else {
      console.error('❌ 공감해요 여부 확인 실패:', response.status, response.statusText)
      return Response.json(
        { error: 'Failed to check like' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('❌ 공감해요 여부 확인 오류:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 