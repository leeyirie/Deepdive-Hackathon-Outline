export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('🔍 Fetching liked posts for userId:', userId)

    // 백엔드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.124.229.252:8080'
    const response = await fetch(`${backendUrl}/posts/liked?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ Backend API error:', response.status, response.statusText)
      return new Response(JSON.stringify({ error: 'Failed to fetch liked posts' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    console.log('✅ Liked posts fetched successfully:', data.length, 'posts')

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Error fetching liked posts:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 