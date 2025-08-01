'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './map.module.scss'

export default function MapPage() {
  const mapRef = useRef(null)
  const naverMap = useRef(null)
  const router = useRouter()

  useEffect(() => {
    // 네이버 지도 API 스크립트 동적 로드
    const script = document.createElement('script')
    script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=48054bm8uv'
    script.async = true
    
    script.onload = () => {
      // 네이버 지도 초기화
      if (window.naver && window.naver.maps && mapRef.current) {
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
          zoom: 10,
          mapTypeControl: true
        }
        
        naverMap.current = new window.naver.maps.Map(mapRef.current, mapOptions)
        
        // 현재 위치 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude
              const lng = position.coords.longitude
              const currentPosition = new window.naver.maps.LatLng(lat, lng)
              
              // 지도 중심을 현재 위치로 이동
              naverMap.current.setCenter(currentPosition)
              
              // 현재 위치에 마커 추가
              new window.naver.maps.Marker({
                position: currentPosition,
                map: naverMap.current,
                title: '현재 위치'
              })
            },
            (error) => {
              console.error('위치 정보를 가져올 수 없습니다:', error)
            }
          )
        }
      }
    }
    
    script.onerror = () => {
      console.error('네이버 지도 API 로드에 실패했습니다.')
    }
    
    document.head.appendChild(script)
    
    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <div className={styles.mapPageContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={styles.title}>지도</h1>
        <div className={styles.placeholder}></div>
      </header>

      {/* 지도 컨테이너 */}
      <div className={styles.mapWrapper}>
        <div ref={mapRef} className={styles.map}></div>
      </div>

      {/* 하단 컨트롤 */}
      <div className={styles.controls}>
        <button className={styles.locationButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
          현재 위치
        </button>
      </div>
    </div>
  )
}