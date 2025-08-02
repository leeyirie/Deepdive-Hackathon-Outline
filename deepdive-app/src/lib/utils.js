/**
 * 백엔드 이미지 URL을 프론트엔드 프록시 URL로 변환
 * @param {string|string[]} imageUrl - 백엔드에서 반환된 이미지 URL 또는 URL 배열
 * @returns {string|string[]} 프록시 URL로 변환된 이미지 URL
 */
export function convertImageUrl(imageUrl) {
  if (!imageUrl) return imageUrl
  
  // 배열인 경우 각 요소를 변환
  if (Array.isArray(imageUrl)) {
    return imageUrl.map(url => convertImageUrl(url))
  }
  
  // 문자열인 경우 변환
  if (typeof imageUrl === 'string') {
    console.log('🔍 convertImageUrl 입력:', imageUrl)
    
    // 이미 프록시 URL인 경우 그대로 반환
    if (imageUrl.startsWith('/api/uploads/')) {
      console.log('✅ 이미 프록시 URL, 그대로 반환:', imageUrl)
      return imageUrl
    }
    
    // 이미 전체 URL인 경우 프록시로 변환
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // http://13.124.229.252:8080/uploads/filename.jpg -> /api/uploads/filename.jpg
      const urlObj = new URL(imageUrl)
      const path = urlObj.pathname
      if (path.startsWith('/uploads/')) {
        const proxyUrl = `/api${path}`
        console.log('🔄 전체 URL을 프록시로 변환:', imageUrl, '->', proxyUrl)
        return proxyUrl
      }
      console.log('🌐 전체 URL, 그대로 반환:', imageUrl)
      return imageUrl
    }
    
    // /uploads/filename.jpg -> /api/uploads/filename.jpg
    if (imageUrl.startsWith('/uploads/')) {
      const proxyUrl = `/api${imageUrl}`
      console.log('🔄 프록시 URL로 변환:', imageUrl, '->', proxyUrl)
      return proxyUrl
    }
    
    // /filename.jpg -> /api/uploads/filename.jpg (uploads 추가)
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('/uploads/')) {
      const proxyUrl = `/api/uploads${imageUrl}`
      console.log('🔄 프록시 URL로 변환 (uploads 추가):', imageUrl, '->', proxyUrl)
      return proxyUrl
    }
    
    // filename.jpg -> /api/uploads/filename.jpg (슬래시 추가)
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      const proxyUrl = `/api/uploads/${imageUrl}`
      console.log('🔄 프록시 URL로 변환 (슬래시 추가):', imageUrl, '->', proxyUrl)
      return proxyUrl
    }
  }
  
  console.log('❓ 알 수 없는 형태, 그대로 반환:', imageUrl)
  return imageUrl
}

/**
 * 백엔드 이미지 URL을 직접 백엔드 URL로 변환 (CORS 허용 시 사용)
 * @param {string|string[]} imageUrl - 백엔드에서 반환된 이미지 URL 또는 URL 배열
 * @returns {string|string[]} 백엔드 URL로 변환된 이미지 URL
 */
export function convertImageUrlDirect(imageUrl) {
  if (!imageUrl) return imageUrl
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://13.124.229.252:8080'
  
  // 배열인 경우 각 요소를 변환
  if (Array.isArray(imageUrl)) {
    return imageUrl.map(url => convertImageUrlDirect(url))
  }
  
  // 문자열인 경우 변환
  if (typeof imageUrl === 'string') {
    // 이미 전체 URL인 경우 그대로 반환
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // /uploads/filename.jpg -> http://13.124.229.252:8080/uploads/filename.jpg
    if (imageUrl.startsWith('/uploads/')) {
      return `${BACKEND_URL}${imageUrl}`
    }
    
    // 상대 경로인 경우
    if (imageUrl.startsWith('/')) {
      return `${BACKEND_URL}${imageUrl}`
    }
  }
  
  return imageUrl
}

/**
 * 시간을 "~전" 형식으로 변환하는 함수
 * @param {string|number|Date} createdAt - 생성 시간
 * @returns {string} "~전" 형식의 문자열
 */
export function formatTimeAgo(createdAt) {
  if (!createdAt) return ''
  
  try {
    let created
    
    // 다양한 시간 형식 처리
    if (typeof createdAt === 'string') {
      // ISO 문자열 형식인지 확인
      if (createdAt.includes('T') && createdAt.includes('Z')) {
        // ISO 8601 형식 (예: "2024-01-15T10:30:00Z")
        created = new Date(createdAt)
      } else if (createdAt.includes('T') && !createdAt.includes('Z')) {
        // ISO 형식이지만 Z가 없는 경우 (예: "2024-01-15T10:30:00")
        created = new Date(createdAt + 'Z')
      } else {
        // 일반 문자열 형식
        created = new Date(createdAt)
      }
    } else if (typeof createdAt === 'number') {
      // 타임스탬프 형식
      created = new Date(createdAt)
    } else {
      // Date 객체인 경우
      created = new Date(createdAt)
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(created.getTime())) {
      console.warn('Invalid date format:', createdAt, 'Type:', typeof createdAt)
      return ''
    }
    
    // 한국 시간대로 변환 (UTC+9)
    const koreaTimeOffset = 9 * 60 * 60 * 1000 // 9시간을 밀리초로
    const koreaCreated = new Date(created.getTime() + koreaTimeOffset)
    
    // 현재 시간 (한국 시간대)
    const now = new Date()
    const koreaNow = new Date(now.getTime() + koreaTimeOffset)
    
    // 시간 차이 계산 (밀리초)
    const diffMs = koreaNow.getTime() - koreaCreated.getTime()
    
    // 디버깅을 위한 로그 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('🕐 시간 계산 디버깅:', {
        original: createdAt,
        parsed: created,
        koreaCreated: koreaCreated.toISOString(),
        koreaNow: koreaNow.toISOString(),
        diffMs: diffMs,
        diffHours: Math.floor(diffMs / (1000 * 60 * 60))
      })
    }
    
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)
    
    if (diffMs < 0) return '방금 전' // 미래 시간인 경우
    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 30) return `${diffDays}일 전`
    if (diffMonths < 12) return `${diffMonths}개월 전`
    return `${diffYears}년 전`
  } catch (error) {
    console.error('Error formatting time:', error, 'Input:', createdAt)
    return ''
  }
}

/**
 * 도 이름을 locationCode 접두사로 변환
 * @param {string} provinceName - 도 이름 (예: "강원도", "경상북도")
 * @returns {string} locationCode 접두사 (예: "1", "12")
 */
export function getProvinceCode(provinceName) {
  const provinceMap = {
    '강원도': '1',
    '충청북도': '3',
    '충청남도': '4',
    '경상북도': '12',
    '경상남도': '13',
    '전라북도': '7',
    '전라남도': '8',
    '제주특별자치도': '14'
  }
  
  return provinceMap[provinceName] || null
}

/**
 * locationCode가 특정 도에 속하는지 확인
 * @param {string} locationCode - locationCode (예: "1-1", "12-3")
 * @param {string} provinceCode - 도 코드 (예: "1", "12")
 * @returns {boolean} 해당 도에 속하는지 여부
 */
export function isLocationInProvince(locationCode, provinceCode) {
  if (!locationCode || !provinceCode) return false
  return locationCode.startsWith(provinceCode + '-')
}

/**
 * 특정 도시에 해당하는 locationCode 목록 반환
 * @param {string} cityName - 도시 이름 (예: "문경시", "창원시")
 * @returns {string[]} 해당 도시의 locationCode 배열
 */
export function getCityLocationCodes(cityName) {
  const cityLocationMap = {
    '문경시': ['12-3'], // 경상북도 문경/상주
    '창원시': ['13-6']  // 경상남도 마산/창원/진해
  }
  
  return cityLocationMap[cityName] || []
}

/**
 * 이슈가 특정 도시에 속하는지 확인
 * @param {string} locationCode - locationCode (예: "12-3", "13-6")
 * @param {string} cityName - 도시 이름 (예: "문경시", "창원시")
 * @returns {boolean} 해당 도시에 속하는지 여부
 */
export function isLocationInCity(locationCode, cityName) {
  if (!locationCode || !cityName) return false
  const cityCodes = getCityLocationCodes(cityName)
  return cityCodes.includes(locationCode)
} 