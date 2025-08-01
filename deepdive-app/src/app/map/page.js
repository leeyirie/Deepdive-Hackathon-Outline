'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import IssueCard from '@/components/IssueCard'
import { fetchNearbyIssues } from '@/lib/services/issues'
import styles from './map.module.scss'

export default function MapPage() {
  const mapRef = useRef(null)
  const naverMap = useRef(null)
  const router = useRouter()
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [needBackupScript, setNeedBackupScript] = useState(false)
  const [issues, setIssues] = useState([])
  const [allIssues, setAllIssues] = useState([]) // 전체 이슈 목록
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false)
  const [isLoadingIssues, setIsLoadingIssues] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [markers, setMarkers] = useState([])
  const [currentZoom, setCurrentZoom] = useState(12)

  // 이슈 데이터 가져오기
  const loadNearbyIssues = async (lat, lng) => {
    try {
      setIsLoadingIssues(true)
      const issuesData = await fetchNearbyIssues(lat, lng)
      setAllIssues(issuesData) // 전체 이슈 목록 저장
      setIssues(issuesData) // 초기에는 모든 이슈 표시
      setIsLoadingIssues(false)
      return issuesData
    } catch (error) {
      console.error('이슈 데이터 가져오기 실패:', error)
      setIsLoadingIssues(false)
      return []
    }
  }

  // 지도에 이슈 마커 추가
  const addIssueMarkers = (issues) => {
    if (!naverMap.current || !window.naver) return

    // 기존 마커들 제거
    markers.forEach(marker => marker.setMap(null))
    const newMarkers = []

    issues.forEach(issue => {
      // API에서 받은 실제 위치 데이터 사용
      const position = new window.naver.maps.LatLng(
        parseFloat(issue.latitude) || parseFloat(issue.lat) || 37.5665, 
        parseFloat(issue.longitude) || parseFloat(issue.lng) || 126.9780
      )
      
      // 네이버 맵 기본 마커 사용
      const marker = new window.naver.maps.Marker({
        position: position,
        map: naverMap.current,
        title: issue.title
      })

      // 마커 클릭 이벤트 - 해당 지역 이슈들을 바텀시트에 표시
      window.naver.maps.Event.addListener(marker, 'click', () => {
        // 클릭한 마커 주변의 이슈들을 필터링하여 바텀시트에 표시 (반경 0.005도 = 약 500m)
        const clickedIssues = allIssues.filter(i => {
          const issueLat = parseFloat(i.latitude || i.lat)
          const issueLng = parseFloat(i.longitude || i.lng)
          const markerLat = parseFloat(issue.latitude || issue.lat)
          const markerLng = parseFloat(issue.longitude || issue.lng)
          
          return Math.abs(issueLat - markerLat) < 0.005 &&
                 Math.abs(issueLng - markerLng) < 0.005
        })
        
        console.log(`마커 클릭: ${issue.title}, 주변 이슈 ${clickedIssues.length}개 발견`)
        setIssues(clickedIssues)
        setIsBottomSheetExpanded(true)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
    
    // 현재 줌 레벨에 따라 마커 가시성 설정
    if (naverMap.current) {
      const currentZoomLevel = naverMap.current.getZoom()
      newMarkers.forEach(marker => {
        if (currentZoomLevel >= 8) {
          marker.setVisible(true)
        } else {
          marker.setVisible(false)
        }
      })
    }
  }

  // 줌 레벨에 따른 마커 가시성 업데이트
  const updateMarkersVisibility = (zoom) => {
    markers.forEach(marker => {
      if (zoom >= 8) {
        // 줌 레벨이 8 이상일 때 마커 표시 (더 관대하게)
        marker.setVisible(true)
      } else {
        // 줌 레벨이 8 미만일 때 마커 숨김
        marker.setVisible(false)
      }
    })
  }

  const initializeMap = () => {
    console.log('🗺️ 지도 초기화 시작')
    
    if (window.naver && window.naver.maps && mapRef.current) {
      try {
        console.log('🗺️ 지도 생성 시작 - 고속 모드')
        
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780),
          zoom: 11,
          mapTypeControl: false,
          zoomControl: false,
          logoControl: false,
          mapDataControl: false,
          scaleControl: false,
          disableDoubleClickZoom: true,
          scrollWheel: true,
          keyboardShortcuts: false,
          draggable: true,
          pinchZoom: true,
          // 렌더링 최적화 설정
          tileSpare: 0, // 타일 스페어 최소화
          tileTransition: false, // 타일 전환 애니메이션 비활성화
          useStyleMap: false, // 스타일 맵 비활성화
          enableWheelZoom: true,
          enableDragPan: true,
          minZoom: 7,
          maxZoom: 18,
          // 추가 성능 최적화
          tileCaching: true, // 타일 캐싱 활성화
          backgroundColor: '#f5f5f5' // 배경색 설정으로 로딩 시 깜빡임 방지
        }
        
        naverMap.current = new window.naver.maps.Map(mapRef.current, mapOptions)
        console.log('⚡ 고속 지도 생성 완료!')
        
        let loadingComplete = false
        
        const onMapReady = () => {
          if (!loadingComplete) {
            loadingComplete = true
            console.log('🎯 지도 로딩 완료 - 초고속!')
            
            setTimeout(() => {
              naverMap.current.setOptions({
                zoomControl: true
              })
            }, 500)
          }
        }
        
        window.naver.maps.Event.addListener(naverMap.current, 'idle', onMapReady)
        window.naver.maps.Event.addListener(naverMap.current, 'tilesloaded', onMapReady)
        
        // 줌 변경 이벤트 리스너 추가
        window.naver.maps.Event.addListener(naverMap.current, 'zoom_changed', () => {
          const zoom = naverMap.current.getZoom()
          setCurrentZoom(zoom)
          console.log('줌 레벨 변경:', zoom)
          
          // 줌 레벨에 따라 마커 표시/숨김 조정
          updateMarkersVisibility(zoom)
        })
        
        setTimeout(onMapReady, 50)
        
        // 현재 위치 가져오기 및 이슈 표시 (더 빠르게)
        setTimeout(() => {
          if (navigator.geolocation && naverMap.current) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                console.log('📍 현재 위치 적용')
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                const currentPosition = new window.naver.maps.LatLng(lat, lng)
                
                setCurrentLocation({ lat, lng })
                
                naverMap.current.setCenter(currentPosition)
                naverMap.current.setZoom(15)
                
                // 현재 위치 마커 (네이버 맵 기본 스타일)
                new window.naver.maps.Marker({
                  position: currentPosition,
                  map: naverMap.current,
                  title: '현재 위치'
                })

                // 근처 이슈 가져오기 및 마커 표시
                const nearbyIssues = await loadNearbyIssues(lat, lng)
                addIssueMarkers(nearbyIssues)
              },
              async () => {
                console.log('위치 정보 사용 안함 - 기본 위치 유지')
                // 기본 위치에서도 이슈 표시
                const defaultIssues = await loadNearbyIssues(37.5665, 126.9780)
                addIssueMarkers(defaultIssues)
              },
              { 
                timeout: 5000,
                enableHighAccuracy: false,
                maximumAge: 300000
              }
            )
          }
        }, 500)
        
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
          
          naverMap.current.setCenter(currentPosition)
          naverMap.current.setZoom(15)
          
          console.log('📍 현재 위치로 이동:', position.coords)
        },
        (error) => {
          console.error('❌ 위치 정보를 가져올 수 없습니다:', error)
          alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.')
        }
      )
    }
  }

  const toggleBottomSheet = () => {
    if (!isBottomSheetExpanded) {
      // 축소된 상태에서 클릭하면 확장하고 모든 이슈 표시
      setIssues(allIssues)
    }
    setIsBottomSheetExpanded(!isBottomSheetExpanded)
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
      console.error('🔍 디버깅 정보:')
      console.error('1. 클라이언트 ID:', process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '48054bm8uv')
      console.error('2. 현재 URL:', window.location.href)
      console.error('3. 환경변수 확인:', process.env.NODE_ENV)
      console.error('4. 해결 방법:')
      console.error('   - 네이버 클라우드 플랫폼에서 서비스 URL 설정 확인')
      console.error('   - API 키가 올바른지 확인')
      console.error('   - Web Dynamic Map 서비스 활성화 확인')
      console.error('   - 현재 도메인이 등록되어 있는지 확인')
      
      // 사용자에게 친화적인 에러 메시지 표시
      alert('네이버 지도 API 인증에 실패했습니다.\n\n해결 방법:\n1. 네이버 클라우드 플랫폼에서 서비스 URL 설정 확인\n2. API 키가 올바른지 확인\n3. Web Dynamic Map 서비스 활성화 확인\n4. 현재 도메인이 등록되어 있는지 확인')
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
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '48054bm8uv'}&callback=initNaverMap`}
          strategy="beforeInteractive"
          onLoad={() => {
            console.log('✅ 백업 스크립트로 네이버 지도 API 로드 완료')
            window.naverMapPreloaded = true
            setNeedBackupScript(false)
          }}
          onError={(error) => {
            console.error('❌ 백업 스크립트 로드 실패:', error)
            console.error('🔍 디버깅 정보:')
            console.error('1. API 키:', process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '48054bm8uv')
            console.error('2. 현재 URL:', window.location.href)
            console.error('3. 환경변수 확인:', process.env.NODE_ENV)
            console.error('4. 가능한 원인:')
            console.error('   - API 키 인증 실패')
            console.error('   - 서비스 URL 미설정')
            console.error('   - Web Dynamic Map 서비스 미활성화')
            console.error('   - 도메인 등록 필요')
            
            // 사용자에게 친화적인 에러 메시지 표시
            alert('네이버 지도 API 로드에 실패했습니다.\n\n해결 방법:\n1. 네이버 클라우드 플랫폼에서 서비스 URL 설정 확인\n2. API 키가 올바른지 확인\n3. Web Dynamic Map 서비스 활성화 확인\n4. 현재 도메인이 등록되어 있는지 확인')
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
          <h1 className={styles.title}>전국 이슈</h1>
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

        {/* 바텀시트 */}
        <div className={`${styles.bottomSheet} ${isBottomSheetExpanded ? styles.expanded : ''}`} onClick={!isBottomSheetExpanded ? toggleBottomSheet : undefined}>
          <div className={styles.bottomSheetContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.bottomSheetHeader}>
              <div className={styles.bottomSheetHandle} onClick={toggleBottomSheet}></div>
              <div className={styles.headerContent}>
                <h3>이 주변 이슈 ({issues.length})</h3>
                <p>해당 지역에 등록된 주요 상황을 확인하세요</p>
              </div>
              {isBottomSheetExpanded && (
                <button className={styles.closeButton} onClick={toggleBottomSheet}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
            
            {isBottomSheetExpanded && (
              <div className={styles.issuesList}>
                {isLoadingIssues ? (
                  <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>주변 이슈를 찾고 있습니다...</p>
                  </div>
                ) : issues.length > 0 ? (
                  issues.map((issue) => (
                    <IssueCard key={issue.id} post={issue} />
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📍</div>
                    <h4>이 지역에 등록된 이슈가 없습니다</h4>
                    <p>새로운 이슈를 제보해주세요</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}