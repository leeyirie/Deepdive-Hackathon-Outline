export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const sort = searchParams.get('sort') || 'latest'
    const userId = searchParams.get('userId')
    
    console.log('🔍 검색 요청:', { query, sort, userId })
    
    if (!query || !userId) {
      return Response.json(
        { error: 'query and userId are required' },
        { status: 400 }
      )
    }
    
    // 기존 게시글 조회 API 사용
    const backendUrl = `http://13.124.229.252:8080/posts?userId=${userId}&sort=${sort}`
    console.log('🔍 전체 게시글 조회 URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const allPosts = await response.json()
      console.log('✅ 전체 게시글 조회 결과:', allPosts)
      
      // 프론트엔드에서 검색어 필터링
      const filteredPosts = allPosts.filter(post => {
        const searchTerm = query.toLowerCase()
        const title = (post.title || '').toLowerCase()
        const content = (post.content || '').toLowerCase()
        
        return title.includes(searchTerm) || content.includes(searchTerm)
      })
      
      console.log('🔍 필터링된 검색 결과:', filteredPosts)
      return Response.json(filteredPosts)
    } else {
      console.error('❌ 게시글 조회 실패:', response.status, response.statusText)
      return Response.json([])
    }
  } catch (error) {
    console.error('❌ 검색 오류:', error)
    return Response.json([])
  }
} 