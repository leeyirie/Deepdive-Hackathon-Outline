'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import IssueCard from '@/components/IssueCard'
import { fetchNearbyIssues } from '@/lib/services/issues'
import { getProvinceCode, isLocationInProvince, isLocationInCity } from '@/lib/utils'
import styles from './map.module.scss'

// useSearchParams를 사용하는 컴포넌트를 분리
function MapContent() {
  const mapRef = useRef(null)
  const naverMap = useRef(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [needBackupScript, setNeedBackupScript] = useState(false)
  const [issues, setIssues] = useState([])
  const [allIssues, setAllIssues] = useState([]) // 전체 이슈 목록
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false)
  const [isLoadingIssues, setIsLoadingIssues] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [markers, setMarkers] = useState([])
  const [currentZoom, setCurrentZoom] = useState(12)
  const [selectedRegion, setSelectedRegion] = useState('') // 선택된 지역

  // 지역별 좌표 정보
  const regionCoordinates = {
    '강원도': { lat: 37.8228, lng: 128.1555, zoom: 8 },
    '충청북도': { lat: 36.8, lng: 127.7, zoom: 8 },
    '충청남도': { lat: 36.5, lng: 126.8, zoom: 8 },
    '경상북도': { lat: 36.5, lng: 128.5, zoom: 8 },
    '경상남도': { lat: 35.5, lng: 128.2, zoom: 8 },
    '전라북도': { lat: 35.8, lng: 127.1, zoom: 8 },
    '전라남도': { lat: 34.8, lng: 126.8, zoom: 8 },
    '제주특별자치도': { lat: 33.5, lng: 126.5, zoom: 10 },
    '문경시': { lat: 36.5946, lng: 128.2015, zoom: 12 },
    '창원시': { lat: 35.2278, lng: 128.6817, zoom: 12 }
  }

  // URL 파라미터에서 지역 정보 가져오기
  useEffect(() => {
    const region = searchParams.get('region')
    console.log('🔍 URL 파라미터 확인:', { region, searchParams: searchParams.toString() })
    if (region) {
      setSelectedRegion(region)
      console.log('📍 선택된 지역:', region)
    }
  }, [searchParams])

  // 선택된 지역에 따라 이슈 필터링
  useEffect(() => {
    if (selectedRegion && allIssues.length > 0) {
      filterIssuesByRegion(selectedRegion)
    }
  }, [selectedRegion, allIssues])

  // 지역별 이슈 필터링 함수
  const filterIssuesByRegion = (regionName) => {
    console.log('🔍 지역별 필터링 시작:', regionName)
    console.log('📦 전체 이슈 개수:', allIssues.length)
    
    let filteredIssues = []
    
    // 문경시, 창원시 특별 처리
    if (regionName === '문경시' || regionName === '창원시') {
      console.log('🏙️ 도시별 필터링:', regionName)
      
      // 전체 이슈의 locationCode 확인
      console.log('📍 전체 이슈 locationCode 목록:', allIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        locationCode: issue.locationCode
      })))
      
      // 해당 도시에 속하는 이슈들만 필터링
      filteredIssues = allIssues.filter(issue => {
        const isInCity = issue.locationCode && isLocationInCity(issue.locationCode, regionName)
        console.log(`🔍 이슈 "${issue.title}" (${issue.locationCode}) - ${isInCity ? '포함' : '제외'}`)
        return isInCity
      })
      
      console.log('✅ 도시별 필터링된 이슈:', filteredIssues.length, '개')
      console.log('📍 선택된 도시:', regionName)
    } else {
      // 도별 필터링 (기존 로직)
      const provinceCode = getProvinceCode(regionName)
      if (!provinceCode) {
        console.error('❌ 알 수 없는 지역:', regionName)
        setIssues(allIssues) // 필터링 실패 시 전체 이슈 표시
        return
      }
      
      console.log('🔍 도 코드:', provinceCode)
      
      // 전체 이슈의 locationCode 확인
      console.log('📍 전체 이슈 locationCode 목록:', allIssues.map(issue => ({
        id: issue.id,
        title: issue.title,
        locationCode: issue.locationCode
      })))
      
      // 해당 도에 속하는 이슈들만 필터링
      filteredIssues = allIssues.filter(issue => {
        const isInProvince = issue.locationCode && isLocationInProvince(issue.locationCode, provinceCode)
        console.log(`🔍 이슈 "${issue.title}" (${issue.locationCode}) - ${isInProvince ? '포함' : '제외'}`)
        return isInProvince
      })
      
      console.log('✅ 도별 필터링된 이슈:', filteredIssues.length, '개')
      console.log('📍 선택된 도:', regionName)
    }
    
    // 기존 마커들 제거
    markers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
    
    // 필터링된 이슈들로 마커 추가
    addIssueMarkers(filteredIssues)
    setIssues(filteredIssues)
    
    console.log('✅ 필터링 완료:', filteredIssues.length, '개 이슈')
  }

  // 근처 이슈 가져오기
  const loadNearbyIssues = async (lat, lng) => {
    try {
      console.log('🔍 근처 이슈 가져오기 시작:', { lat, lng })
      setIsLoadingIssues(true)
      
      // 로그인 시 저장된 사용자 ID를 localStorage에서 가져옴
      const userId = localStorage.getItem('userId')
      console.log('🔍 userId from localStorage:', userId)
      
      if (!userId) {
        console.error('User ID not found')
        return []
      }

      // Next.js API Route를 통해 백엔드 데이터 요청
      const apiUrl = `/api/posts?userId=${userId}&sort=latest`
      console.log('🔍 API URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🗺️ Map posts data:', data)
        
        // 최신순으로 정렬
        const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        setAllIssues(sortedData) // 전체 이슈 저장
        setIssues(sortedData) // 초기에는 전체 이슈 표시
        setIsLoadingIssues(false)
        
        console.log('✅ 근처 이슈 가져오기 성공:', sortedData.length, '개')
        return sortedData
      } else {
        console.error('Failed to fetch posts')
        setIsLoadingIssues(false)
        return []
      }
    } catch (error) {
      console.error('❌ 근처 이슈 가져오기 실패:', error)
      setIsLoadingIssues(false)
      return []
    }
  }

  // locationCode로부터 위치 정보 가져오기
  const getLocationFromCode = (locationCode, baseLatitude = 37.5665, baseLongitude = 126.9780) => {
    if (!locationCode) {
      return { lat: baseLatitude, lng: baseLongitude }
    }
    
    // locationCode 형식: "1-1", "12-3" 등
    const parts = locationCode.split('-')
    if (parts.length !== 2) {
      return { lat: baseLatitude, lng: baseLongitude }
    }
    
    const regionCode = parts[0]
    const subRegionCode = parts[1]
    
    // 간단한 위치 매핑 (실제로는 더 정확한 좌표 데이터가 필요)
    const baseCoordinates = {
      '1': { lat: 37.8228, lng: 128.1555 }, // 강원도
      '3': { lat: 36.8, lng: 127.7 }, // 충청북도
      '4': { lat: 36.5, lng: 126.8 }, // 충청남도
      '12': { lat: 36.5, lng: 128.5 }, // 경상북도
      '13': { lat: 35.5, lng: 128.2 }, // 경상남도
      '7': { lat: 35.8, lng: 127.1 }, // 전라북도
      '8': { lat: 34.8, lng: 126.8 }, // 전라남도
      '14': { lat: 33.5, lng: 126.5 } // 제주특별자치도
    }
    
    const baseCoord = baseCoordinates[regionCode] || { lat: baseLatitude, lng: baseLongitude }
    
    // 서브 지역에 따른 미세 조정
    const subRegionOffset = parseInt(subRegionCode) * 0.1
    return {
      lat: baseCoord.lat + subRegionOffset,
      lng: baseCoord.lng + subRegionOffset
    }
  }

  // 이슈 마커 추가
  const addIssueMarkers = (issues) => {
    if (!naverMap.current) return
    
    const newMarkers = []
    
    issues.forEach(issue => {
      const location = getLocationFromCode(issue.locationCode)
      
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(location.lat, location.lng),
        map: naverMap.current,
        title: issue.title,
        icon: {
          content: `
            <div style="
              background-color: ${issue.status === 0 ? '#ef4444' : issue.status === 1 ? '#3b82f6' : '#10b981'};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              ${issue.status === 0 ? '진행중' : issue.status === 1 ? '해결중' : '해결됨'}
            </div>
          `,
          size: new window.naver.maps.Size(60, 30),
          anchor: new window.naver.maps.Point(30, 15)
        }
      })
      
      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        router.push(`/issues/${issue.id}`)
      })
      
      newMarkers.push(marker)
    })
    
    setMarkers(newMarkers)
  }

  // 줌 레벨에 따른 마커 표시/숨김
  const updateMarkersVisibility = (zoom) => {
    markers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(zoom >= 8 ? naverMap.current : null)
      }
    })
  }

  // 지도 초기화
  const initializeMap = () => {
    if (!window.naver || !mapRef.current) return
    
    console.log('🗺️ 지도 초기화 시작')
    
    // 선택된 지역에 따른 초기 위치 설정
    let initialLat = 37.5665
    let initialLng = 126.9780
    let initialZoom = 12
    
    if (selectedRegion && regionCoordinates[selectedRegion]) {
      const regionCoord = regionCoordinates[selectedRegion]
      initialLat = regionCoord.lat
      initialLng = regionCoord.lng
      initialZoom = regionCoord.zoom
      console.log('📍 선택된 지역으로 초기 위치 설정:', selectedRegion, regionCoord)
    }
    
    naverMap.current = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(initialLat, initialLng),
      zoom: initialZoom,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT
      },
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      streetViewControl: false,
      minZoom: 6,
      maxZoom: 18
    })
    
    // 지도 로드 완료 후 이슈 로드
    window.naver.maps.Event.addListener(naverMap.current, 'init', () => {
      console.log('🗺️ 지도 초기화 완료')
      
      const onMapReady = () => {
        console.log('🗺️ 지도 준비 완료')
        
        // 선택된 지역이 있으면 해당 지역의 이슈만 로드
        if (selectedRegion && regionCoordinates[selectedRegion]) {
          const regionCoord = regionCoordinates[selectedRegion]
          loadNearbyIssues(regionCoord.lat, regionCoord.lng).then(regionIssues => {
            if (selectedRegion) {
              filterIssuesByRegion(selectedRegion) // 선택된 지역으로 필터링
            } else {
              addIssueMarkers(regionIssues)
              setIssues(regionIssues)
            }
            setIsBottomSheetExpanded(true)
          })
        } else {
          // 기본 위치에서 이슈 로드
          loadNearbyIssues(initialLat, initialLng).then(issues => {
            addIssueMarkers(issues)
            setIssues(issues)
            setIsBottomSheetExpanded(true)
          })
        }
      }
      
      // 지도가 완전히 로드된 후 실행
      setTimeout(onMapReady, 100)
    })
    
    // 줌 변경 이벤트
    window.naver.maps.Event.addListener(naverMap.current, 'zoom_changed', () => {
      const zoom = naverMap.current.getZoom()
      setCurrentZoom(zoom)
      updateMarkersVisibility(zoom)
    })
    
    // 지도 클릭 시 바텀시트 닫기
    window.naver.maps.Event.addListener(naverMap.current, 'click', () => {
      setIsBottomSheetExpanded(false)
    })
  }

  // 현재 위치로 이동
  const moveToCurrentLocation = () => {
    if (navigator.geolocation && naverMap.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const latlng = new window.naver.maps.LatLng(latitude, longitude)
          naverMap.current.setCenter(latlng)
          naverMap.current.setZoom(15)
          setCurrentLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error)
        }
      )
    }
  }

  // 바텀시트 토글
  const toggleBottomSheet = () => {
    if (!isBottomSheetExpanded) {
      if (selectedRegion) {
        filterIssuesByRegion(selectedRegion) // 선택된 지역으로 필터링
      } else {
        setIssues(allIssues) // 전체 이슈 표시
      }
    }
    setIsBottomSheetExpanded(!isBottomSheetExpanded)
  }

  // 스크립트 로드 확인
  useEffect(() => {
    const checkPreloadedAPI = () => {
      if (window.naver && window.naver.maps) {
        console.log('✅ 네이버 지도 API 이미 로드됨')
        setScriptLoaded(true)
        return true
      }
      return false
    }

    if (!checkPreloadedAPI()) {
      console.log('⏳ 네이버 지도 API 로드 대기 중...')
      const interval = setInterval(() => {
        if (checkPreloadedAPI()) {
          clearInterval(interval)
        }
      }, 100)

      return () => clearInterval(interval)
    }
  }, [])

  // 스크립트 로드 완료 후 지도 초기화
  useEffect(() => {
    if (scriptLoaded) {
      initializeMap()
    }
  }, [scriptLoaded])

  return (
    <div className={styles.mapContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className={styles.title}>
          {selectedRegion ? `${selectedRegion} 이슈` : '전국 이슈'}
        </h1>
        <div className={styles.placeholder}></div>
      </header>

      <div ref={mapRef} className={styles.map} />
      
      {/* 현재 위치 버튼 */}
      <button className={styles.currentLocationButton} onClick={moveToCurrentLocation}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
        </svg>
      </button>
      
      {/* 바텀시트 */}
      <div className={`${styles.bottomSheet} ${isBottomSheetExpanded ? styles.expanded : ''}`}>
        <div className={styles.bottomSheetHeader} onClick={toggleBottomSheet}>
          <div className={styles.bottomSheetHandle} />
          <h3 className={styles.bottomSheetTitle}>
            {selectedRegion ? `${selectedRegion} 이슈` : '근처 이슈'}
            <span className={styles.issueCount}>({issues.length})</span>
          </h3>
        </div>
        
        <div className={styles.bottomSheetContent}>
          {isLoadingIssues ? (
            <div className={styles.loadingContainer}>
              <p>이슈를 불러오는 중...</p>
            </div>
          ) : issues.length > 0 ? (
            <div className={styles.issueList}>
              {issues.map((issue) => (
                <IssueCard key={issue.id} post={issue} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyContainer}>
              <p>근처에 제보된 이슈가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function MapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapContent />
    </Suspense>
  )
}