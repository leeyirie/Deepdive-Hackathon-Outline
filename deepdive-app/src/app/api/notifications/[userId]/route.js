import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE_URL = process.env.API_BASE_URL || 'http://13.124.229.252:8080'

export async function GET(request, { params }) {
  try {
    const { userId } = params
    
    const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('알림 API 프록시 오류:', error)
    return NextResponse.json(
      { error: '알림을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
} 