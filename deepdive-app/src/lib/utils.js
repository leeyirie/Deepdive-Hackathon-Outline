/**
 * 백엔드 이미지 URL을 백엔드 서버 URL로 변환
 * @param {string|string[]} imageUrl - 백엔드에서 반환된 이미지 URL 또는 URL 배열
 * @returns {string|string[]} 백엔드 서버 URL로 변환된 이미지 URL
 */
export function convertImageUrl(imageUrl) {
  if (!imageUrl) return imageUrl
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.124.229.252:8080'
  
  // 배열인 경우 각 요소를 변환
  if (Array.isArray(imageUrl)) {
    return imageUrl.map(url => convertImageUrl(url))
  }
  
  // 문자열인 경우 변환
  if (typeof imageUrl === 'string') {
    console.log('🔍 convertImageUrl 입력:', imageUrl)
    
    // 이미 전체 URL인 경우 그대로 반환
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('🌐 전체 URL, 그대로 반환:', imageUrl)
      return imageUrl
    }
    
    // /uploads/filename.jpg -> http://13.124.229.252:8080/uploads/filename.jpg
    if (imageUrl.startsWith('/uploads/')) {
      const fullUrl = `${BACKEND_URL}${imageUrl}`
      console.log('🔄 백엔드 URL로 변환 (uploads 포함):', imageUrl, '->', fullUrl)
      return fullUrl
    }
    
    // /filename.jpg -> http://13.124.229.252:8080/filename.jpg (uploads 없이)
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('/uploads/')) {
      const fullUrl = `${BACKEND_URL}${imageUrl}`
      console.log('🔄 백엔드 URL로 변환 (uploads 없음):', imageUrl, '->', fullUrl)
      return fullUrl
    }
    
    // filename.jpg -> http://13.124.229.252:8080/filename.jpg (슬래시 없이)
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      const fullUrl = `${BACKEND_URL}/${imageUrl}`
      console.log('🔄 백엔드 URL로 변환 (슬래시 추가):', imageUrl, '->', fullUrl)
      return fullUrl
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
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://13.124.229.252:8080'
  
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