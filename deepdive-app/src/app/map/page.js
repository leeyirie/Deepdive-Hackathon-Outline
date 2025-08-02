'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import IssueCard from '@/components/IssueCard'
import { fetchNearbyIssues } from '@/lib/services/issues'
import { getProvinceCode, isLocationInProvince, isLocationInCity } from '@/lib/utils'
import styles from './map.module.scss'

export default function MapPage() {
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
      console.log('📍 선택된 도:', regionName, '코드:', provinceCode)
    }
    
    setIssues(filteredIssues)
    console.log('📋 최종 필터링된 이슈 목록:', filteredIssues.map(issue => ({
      id: issue.id,
      title: issue.title,
      locationCode: issue.locationCode
    })))
  }

  // 이슈 데이터 가져오기
  const loadNearbyIssues = async (lat, lng) => {
    try {
      setIsLoadingIssues(true)
      
      // 사용자 ID 가져오기
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('User ID not found')
        setIsLoadingIssues(false)
        return []
      }

      // 직접 posts API 호출
      const response = await fetch(`/api/posts?userId=${userId}&sort=latest`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📦 Posts API 응답 데이터:', data)
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ API 응답이 배열이 아닙니다')
        setIsLoadingIssues(false)
        return []
      }

      // 백엔드 데이터를 지도용 형식으로 변환
      const mappedData = data.map(post => {
        // locationCode를 기반으로 위치 결정
        const location = post.latitude && post.longitude 
          ? { lat: post.latitude, lng: post.longitude }
          : getLocationFromCode(post.locationCode, lat, lng)
        
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

      setAllIssues(mappedData) // 전체 이슈 목록 저장
      
      // 선택된 지역이 있으면 필터링 적용
      if (selectedRegion) {
        filterIssuesByRegion(selectedRegion)
      } else {
        setIssues(mappedData) // 초기에는 모든 이슈 표시
      }
      
      setIsLoadingIssues(false)
      return mappedData
    } catch (error) {
      console.error('이슈 데이터 가져오기 실패:', error)
      setIsLoadingIssues(false)
      return []
    }
  }

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
        
        // 선택된 지역에 따라 지도 중심과 줌 설정
        let centerLat = 37.5665
        let centerLng = 126.9780
        let zoomLevel = 11
        
        if (selectedRegion && regionCoordinates[selectedRegion]) {
          const regionCoord = regionCoordinates[selectedRegion]
          centerLat = regionCoord.lat
          centerLng = regionCoord.lng
          zoomLevel = regionCoord.zoom
          console.log(`📍 선택된 지역 ${selectedRegion}으로 지도 중심 이동:`, regionCoord)
        }
        
        const mapOptions = {
          center: new window.naver.maps.LatLng(centerLat, centerLng),
          zoom: zoomLevel,
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
        
        // 지도 클릭 이벤트 리스너 추가
        window.naver.maps.Event.addListener(naverMap.current, 'click', (e) => {
          console.log('🗺️ 지도 클릭:', e.coord)
          // 지도 클릭 시 바텀시트 닫기
          setIsBottomSheetExpanded(false)
        })
        
        setTimeout(onMapReady, 50)
        
        // 선택된 지역 또는 현재 위치로 이동
        setTimeout(() => {
          if (selectedRegion && regionCoordinates[selectedRegion] && naverMap.current) {
            // 선택된 지역으로 이동
            const regionCoord = regionCoordinates[selectedRegion]
            const regionPosition = new window.naver.maps.LatLng(regionCoord.lat, regionCoord.lng)
            
            console.log(`📍 초기화 시 선택된 지역으로 이동: ${selectedRegion}`, regionCoord)
            
            naverMap.current.setCenter(regionPosition)
            naverMap.current.setZoom(regionCoord.zoom)
            
            // 해당 지역의 이슈 가져오기 및 마커 표시
            loadNearbyIssues(regionCoord.lat, regionCoord.lng).then(regionIssues => {
              // 필터링된 이슈들만 마커로 표시
              if (selectedRegion) {
                const filteredIssues = regionIssues.filter(issue => {
                  if (selectedRegion === '문경시' || selectedRegion === '창원시') {
                    return issue.locationCode && isLocationInCity(issue.locationCode, selectedRegion)
                  } else {
                    const provinceCode = getProvinceCode(selectedRegion)
                    return provinceCode && issue.locationCode && isLocationInProvince(issue.locationCode, provinceCode)
                  }
                })
                console.log(`📍 ${selectedRegion} 지역 이슈 ${filteredIssues.length}개 마커 표시`)
                addIssueMarkers(filteredIssues)
                setIssues(filteredIssues)
              } else {
                addIssueMarkers(regionIssues)
                setIssues(regionIssues)
              }
              // 바텀시트 자동 확장
              setIsBottomSheetExpanded(true)
            })
          } else if (navigator.geolocation && naverMap.current) {
            // 현재 위치 사용
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

  // 선택된 지역이 변경될 때 지도 위치 업데이트
  useEffect(() => {
    if (scriptLoaded && selectedRegion && regionCoordinates[selectedRegion] && naverMap.current) {
      const regionCoord = regionCoordinates[selectedRegion]
      const regionPosition = new window.naver.maps.LatLng(regionCoord.lat, regionCoord.lng)
      
      console.log(`📍 선택된 지역으로 이동: ${selectedRegion}`, regionCoord)
      
      naverMap.current.setCenter(regionPosition)
      naverMap.current.setZoom(regionCoord.zoom)
      
      // 해당 지역의 이슈 가져오기 및 마커 표시
      loadNearbyIssues(regionCoord.lat, regionCoord.lng).then(regionIssues => {
        addIssueMarkers(regionIssues)
        // 바텀시트 자동 확장
        setIssues(regionIssues)
        setIsBottomSheetExpanded(true)
      })
    }
  }, [selectedRegion, scriptLoaded])

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
          <h1 className={styles.title}>
            {selectedRegion ? `${selectedRegion} 이슈` : '전국 이슈'}
          </h1>
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
                <h3>
                  {selectedRegion ? `${selectedRegion} 이슈` : '이 주변 이슈'} ({issues.length})
                </h3>
                <p>
                  {selectedRegion 
                    ? `${selectedRegion}에 등록된 주요 상황을 확인하세요`
                    : '해당 지역에 등록된 주요 상황을 확인하세요'
                  }
                </p>
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
                    <h4>
                      {selectedRegion 
                        ? `${selectedRegion}에 등록된 이슈가 없습니다`
                        : '이 지역에 등록된 이슈가 없습니다'
                      }
                    </h4>
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