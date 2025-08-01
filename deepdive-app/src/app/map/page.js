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
  const [needBackupScript, setNeedBackupScript] = useState(false)

  const initializeMap = () => {
    console.log('🗺️ 지도 초기화 시작')
    
    // 네이버 지도 초기화
    if (window.naver && window.naver.maps && mapRef.current) {
      try {
        console.log('🗺️ 지도 생성 시작 - 고속 모드')
        
        // 최고 성능을 위한 초경량 지도 옵션
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
          zoom: 12,
          // 모든 컨트롤 비활성화로 최대 속도
          mapTypeControl: false,
          zoomControl: false, // 줌 컨트롤도 비활성화
          logoControl: false,
          mapDataControl: false,
          scaleControl: false,
          // 상호작용 최적화
          disableDoubleClickZoom: true, // 더블클릭 줌 비활성화
          scrollWheel: true,
          keyboardShortcuts: false,
          draggable: true,
          pinchZoom: true,
          // 렌더링 최고 속도 설정
          tileSpare: 1, // 타일 스페어 최소화
          tileTransition: false, // 애니메이션 비활성화로 속도 향상
          // 추가 성능 옵션
          useStyleMap: false, // 스타일 맵 비활성화
          enableWheelZoom: true,
          enableDragPan: true,
          minZoom: 6,
          maxZoom: 18
        }
        
        // 지도 생성 (즉시 실행)
        naverMap.current = new window.naver.maps.Map(mapRef.current, mapOptions)
        console.log('⚡ 고속 지도 생성 완료!')
        
        // 지도 로딩 완료를 더 빠르게 감지
        let loadingComplete = false
        
        const onMapReady = () => {
          if (!loadingComplete) {
            loadingComplete = true
            console.log('🎯 지도 로딩 완료 - 초고속!')
            
            // 컨트롤들을 나중에 추가 (필요한 경우)
            setTimeout(() => {
              naverMap.current.setOptions({
                zoomControl: true // 줌 컨트롤 나중에 활성화
              })
            }, 500)
          }
        }
        
        // 여러 이벤트로 로딩 완료 감지
        window.naver.maps.Event.addListener(naverMap.current, 'idle', onMapReady)
        window.naver.maps.Event.addListener(naverMap.current, 'tilesloaded', onMapReady)
        
        // 백업으로 타이머도 설정
        setTimeout(onMapReady, 100)
        
        // 현재 위치는 더 나중에 (지도 로딩 완료 후)
        setTimeout(() => {
          if (navigator.geolocation && naverMap.current) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('📍 현재 위치 적용')
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                const currentPosition = new window.naver.maps.LatLng(lat, lng)
                
                // 부드러운 이동 대신 즉시 이동
                naverMap.current.setCenter(currentPosition)
                naverMap.current.setZoom(15)
                
                // 마커도 간단하게
                new window.naver.maps.Marker({
                  position: currentPosition,
                  map: naverMap.current,
                  title: '현재 위치'
                })
              },
              () => {
                console.log('위치 정보 사용 안함 - 기본 위치 유지')
              },
              { 
                timeout: 5000, // 5초로 단축
                enableHighAccuracy: false,
                maximumAge: 300000 // 5분간 캐시 사용
              }
            )
          }
        }, 1000) // 1초 후에 위치 정보 요청
        
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
    console.log('🗺️ 지도 페이지 초기화 시작')
    
    // 전역에서 이미 로드된 API 확인
    const checkPreloadedAPI = () => {
      if (window.naverMapPreloaded && window.naver && window.naver.maps) {
        console.log('⚡ 미리 로드된 네이버 지도 API 사용!')
        setScriptLoaded(true)
        return true
      }
      return false
    }

    // 즉시 확인
    if (checkPreloadedAPI()) return

    // 100ms마다 확인 (최대 3초)
    let checkCount = 0
    const maxChecks = 30 // 3초
    const checkInterval = setInterval(() => {
      checkCount++
      if (checkPreloadedAPI() || checkCount >= maxChecks) {
        clearInterval(checkInterval)
        if (checkCount >= maxChecks && !window.naverMapPreloaded) {
          console.log('⏱️ 전역 로딩 대기 시간 초과 - 백업 스크립트 사용')
          setNeedBackupScript(true)
        }
      }
    }, 100)

    // 네이버 지도 API 비동기 로딩을 위한 전역 콜백 함수
    window.initNaverMap = function () {
      console.log('🚀 비동기 콜백으로 네이버 지도 API 초기화 시작')
      clearInterval(checkInterval)
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

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(checkInterval)
      delete window.initNaverMap
      delete window.navermap_authFailure
    }
  }, [])

  return (
    <>
      {/* 전역 로딩이 실패한 경우 백업 스크립트 로드 */}
      {needBackupScript && (
        <Script
          src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=48054bm8uv&callback=initNaverMap"
          strategy="beforeInteractive"
          onLoad={() => {
            console.log('✅ 백업 스크립트로 네이버 지도 API 로드 완료')
            window.naverMapPreloaded = true
            setNeedBackupScript(false)
          }}
          onError={(error) => {
            console.error('❌ 백업 스크립트 로드 실패:', error)
            console.error('가능한 원인:')
            console.error('1. API 키 인증 실패')
            console.error('2. 서비스 URL 미설정')
            console.error('3. Web Dynamic Map 서비스 미활성화')
          }}
        />
      )}
      
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