export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const postId = searchParams.get('postId')

    console.log('🔍 해결했어요 여부 확인 요청:', { userId, postId })

    if (!userId || !postId) {
      return Response.json({ error: 'userId and postId are required' }, { status: 400 })
    }

    const backendUrl = `https://13.124.229.252:8080/solve/check?userId=${userId}&postId=${postId}`
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const isSolved = await response.json()
      console.log('✅ 해결했어요 여부:', isSolved)
      return Response.json(isSolved)
    } else {
      console.error('❌ 해결했어요 여부 확인 실패:', response.status)
      return Response.json({ error: 'Failed to check solve' }, { status: response.status })
    }
  } catch (error) {
    console.error('❌ 해결했어요 여부 확인 오류:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
