'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import styles from './map.module.scss'

export default function MapPage() {
  const mapRef = useRef(null)
  const naverMap = useRef(null)
  const router = useRouter()
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const initializeMap = () => {
    console.log('🗺️ 지도 초기화 시작')
    
    // 네이버 지도 초기화
    if (window.naver && window.naver.maps && mapRef.current) {
      try {
        console.log('🗺️ 지도 생성 시작')
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
          zoom: 10,
          // 성능 최적화를 위한 옵션들
          mapTypeControl: false, // 지도 타입 컨트롤 비활성화로 속도 향상
          zoomControl: true,
          logoControl: false, // 로고 컨트롤 비활성화
          mapDataControl: false, // 지도 데이터 컨트롤 비활성화
          scaleControl: false, // 축척 컨트롤 비활성화
          // 지도 타일 로딩 최적화
          disableDoubleClickZoom: false,
          scrollWheel: true,
          keyboardShortcuts: false, // 키보드 단축키 비활성화로 메모리 절약
          draggable: true,
          pinchZoom: true,
          // 지도 렌더링 최적화
          tileSpare: 2, // 타일 스페어 설정으로 로딩 속도 향상
          tileTransition: true // 타일 전환 애니메이션 활성화
        }
        
        naverMap.current = new window.naver.maps.Map(mapRef.current, mapOptions)
        console.log('✅ 지도 생성 완료')
        
        // 지도 로딩 완료 이벤트 리스너
        window.naver.maps.Event.addListener(naverMap.current, 'idle', function() {
          console.log('🎯 지도 초기 로딩 완료')
        })
        
        // 현재 위치를 비동기로 가져오기 (지도 초기화를 블로킹하지 않음)
        setTimeout(() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('📍 현재 위치:', position.coords)
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
                console.error('❌ 위치 정보를 가져올 수 없습니다:', error)
              },
              { 
                timeout: 10000, // 10초 타임아웃
                enableHighAccuracy: false // 정확도보다 속도 우선
              }
            )
          }
        }, 100) // 100ms 후에 위치 정보 요청
        
      } catch (error) {
        console.error('❌ 지도 생성 중 오류:', error)
      }
    } else {
      console.error('❌ 지도 초기화 실패 - 필요한 객체가 없습니다')
    }
  }

  const moveToCurrentLocation = () => {
    if (navigator.geolocation && naverMap.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const currentPosition = new window.naver.maps.LatLng(lat, lng)
          
          // 지도 중심을 현재 위치로 이동
          naverMap.current.setCenter(currentPosition)
          naverMap.current.setZoom(15) // 줌 레벨을 높여서 더 자세히 보기
          
          console.log('📍 현재 위치로 이동:', position.coords)
        },
        (error) => {
          console.error('❌ 위치 정보를 가져올 수 없습니다:', error)
          alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
        }
      )
    }
  }

  useEffect(() => {
    if (scriptLoaded) {
      initializeMap()
    }
  }, [scriptLoaded])

  useEffect(() => {
    // 네이버 지도 API 비동기 로딩을 위한 전역 콜백 함수
    window.initNaverMap = function () {
      console.log('🚀 비동기 콜백으로 네이버 지도 API 초기화 시작')
      setScriptLoaded(true)
    }

    // 네이버 지도 API 인증 실패 처리 함수
    window.navermap_authFailure = function () {
      console.error('🚫 네이버 지도 API 인증 실패!')
      console.error('클라이언트 ID:', '48054bm8uv')
      console.error('현재 URL:', window.location.href)
      console.error('해결 방법:')
      console.error('1. 네이버 클라우드 플랫폼에서 서비스 URL 설정 확인')
      console.error('2. API 키가 올바른지 확인')
      console.error('3. Web Dynamic Map 서비스 활성화 확인')
      
      alert('네이버 지도 API 인증에 실패했습니다.\n서비스 URL 설정을 확인해주세요.')
    }

    // 컴포넌트 언마운트 시 함수 제거
    return () => {
      delete window.initNaverMap
      delete window.navermap_authFailure
    }
  }, [])

  return (
    <>
      {/* 네이버 지도 API 스크립트 */}
      <Script
        src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=48054bm8uv&callback=initNaverMap"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('✅ Script 컴포넌트로 네이버 지도 API 로드 완료 (새 API)')
        }}
        onError={(error) => {
          console.error('❌ Script 컴포넌트 로드 실패:', error)
          console.error('스크립트 URL:', 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=48054bm8uv')
          console.error('가능한 원인:')
          console.error('1. API 키 인증 실패')
          console.error('2. 서비스 URL 미설정')
          console.error('3. Web Dynamic Map 서비스 미활성화')
        }}
      />
      
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
          <div ref={mapRef} className={styles.map}>
            {!scriptLoaded && (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <div className={styles.loadingText}>
                  <p>지도를 준비하고 있습니다</p>
                  <small>잠시만 기다려주세요...</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 컨트롤 */}
        <div className={styles.controls}>
          <button className={styles.locationButton} onClick={moveToCurrentLocation}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            현재 위치
          </button>
        </div>
      </div>
    </>
  )
}