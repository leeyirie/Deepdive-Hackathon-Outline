import { API_BASE_URL } from '../api'

// locationCode를 실제 위치로 매핑하는 함수
const getLocationFromCode = (locationCode, baseLatitude = 37.5665, baseLongitude = 126.9780) => {
  const locationMap = {
    // 주요 도시
    'SEOUL': { lat: 37.5665, lng: 126.9780 },
    'BUSAN': { lat: 35.1796, lng: 129.0756 },
    'DAEGU': { lat: 35.8714, lng: 128.6014 },
    'INCHEON': { lat: 37.4563, lng: 126.7052 },
    'GWANGJU': { lat: 35.1595, lng: 126.8526 },
    'DAEJEON': { lat: 36.3504, lng: 127.3845 },
    'ULSAN': { lat: 35.5384, lng: 129.3114 },
    'SEJONG': { lat: 36.4800, lng: 127.2890 },
    
    // 구역별 매핑 (서울 기준)
    '1-1': { lat: 37.5665 + 0.01, lng: 126.9780 + 0.01 }, // 서울 중구
    '1-2': { lat: 37.5665 + 0.02, lng: 126.9780 + 0.01 }, // 서울 종로구
    '1-3': { lat: 37.5665 + 0.01, lng: 126.9780 + 0.02 }, // 서울 용산구
    '2-1': { lat: 37.5665 - 0.01, lng: 126.9780 + 0.01 }, // 서울 성동구
    '2-2': { lat: 37.5665 - 0.02, lng: 126.9780 + 0.01 }, // 서울 광진구
    '2-3': { lat: 37.5665 - 0.01, lng: 126.9780 + 0.02 }, // 서울 동대문구
  }

  // locationCode가 매핑 테이블에 있으면 해당 위치 반환
  if (locationMap[locationCode]) {
    return locationMap[locationCode]
  }

  // 없으면 기본 위치 근처에 랜덤 배치
  return {
    lat: baseLatitude + (Math.random() - 0.5) * 0.02,
    lng: baseLongitude + (Math.random() - 0.5) * 0.02
  }
}

// 두 지점 간의 거리 계산 (km 단위)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// 근처 이슈 가져오기
export const fetchNearbyIssues = async (latitude, longitude, radius = 200) => {
  try {
    console.log('🔍 API 호출 시작:', `${API_BASE_URL}/posts?userId=1`)
    
    // 실제 백엔드 API 호출 - posts 엔드포인트 사용
    const response = await fetch(`${API_BASE_URL}/posts?userId=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('📦 API 응답 데이터:', data)
    
    if (!data.value || !Array.isArray(data.value)) {
      console.warn('⚠️ API 응답에 value 배열이 없습니다')
      return []
    }

    // 백엔드 데이터를 지도용 형식으로 변환
    const mappedData = data.value.map(post => {
      // locationCode를 기반으로 위치 결정
      const location = post.latitude && post.longitude 
        ? { lat: post.latitude, lng: post.longitude }
        : getLocationFromCode(post.locationCode, latitude, longitude)
      
      return {
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        createdAt: post.createdAt,
        likeCount: post.likeCount || 0,
        imageUrl: post.imageUrl,
        locationCode: post.locationCode,
        latitude: location.lat,
        longitude: location.lng
      }
    })

    // 모든 이슈를 일단 표시 (거리 필터링 임시 비활성화)
    console.log(`✅ 총 ${data.value.length}개 이슈를 모두 표시합니다`)
    
    // 각 이슈의 위치 정보 로그
    mappedData.forEach(issue => {
      const distance = calculateDistance(latitude, longitude, issue.latitude, issue.longitude)
      console.log(`📍 이슈 "${issue.title}" (${issue.locationCode}) - 위치: ${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)} - 거리: ${distance.toFixed(2)}km`)
    })
    
    return mappedData
    
  } catch (error) {
    console.error('❌ 근처 이슈 가져오기 실패:', error)
    // 에러 시 빈 배열 반환 (더미 데이터 제거)
    return []
  }
}



// 모든 이슈 가져오기
export const fetchAllIssues = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/issues`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('이슈 목록 가져오기 실패:', error)
    return []
  }
}

// 특정 이슈 상세 정보 가져오기
export const fetchIssueDetail = async (issueId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/issues/${issueId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('이슈 상세 정보 가져오기 실패:', error)
    return null
  }
} 