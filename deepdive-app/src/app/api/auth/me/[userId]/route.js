export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { userId } = params
    
    console.log('🔍 Fetching user info for userId:', userId)
    
    // 백엔드 API 호출
    const backendUrl = `http://13.124.229.252:8080/auth/me/${userId}`
    console.log('🔍 Backend URL:', backendUrl)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const userData = await response.json()
      console.log('✅ User data received:', userData)
      
      return Response.json(userData)
    } else {
      console.error('❌ Failed to fetch user data:', response.status, response.statusText)
      return Response.json(
        { error: 'Failed to fetch user data' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('❌ Error fetching user data:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 