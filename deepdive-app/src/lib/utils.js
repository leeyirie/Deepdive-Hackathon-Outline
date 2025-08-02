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