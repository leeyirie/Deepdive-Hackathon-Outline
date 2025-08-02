export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { userId, postId } = await request.json()
    console.log('🔍 해결했어요 등록 요청:', { userId, postId })

    const backendUrl = 'http://13.124.229.252:8080/solve'
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId }),
    })

    if (response.ok) {
      console.log('✅ 해결했어요 등록 성공')
      return Response.json({ success: true })
    } else {
      console.error('❌ 해결했어요 등록 실패:', response.status)
      return Response.json({ error: 'Failed to add solve' }, { status: response.status })
    }
  } catch (error) {
    console.error('❌ 해결했어요 등록 오류:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { userId, postId } = await request.json()
    console.log('🔍 해결했어요 취소 요청:', { userId, postId })

    const backendUrl = 'http://13.124.229.252:8080/solve'
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId }),
    })

    if (response.ok) {
      console.log('✅ 해결했어요 취소 성공')
      return Response.json({ success: true })
    } else {
      console.error('❌ 해결했어요 취소 실패:', response.status)
      return Response.json({ error: 'Failed to remove solve' }, { status: response.status })
    }
  } catch (error) {
    console.error('❌ 해결했어요 취소 오류:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
