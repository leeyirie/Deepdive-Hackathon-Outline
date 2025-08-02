'use client'
import { useState, useEffect, useRef } from 'react'
import Icon from '@/components/icons/Icon'
import styles from './MapLocationModal.module.scss'

// 지도 위치 선택 모달 컴포넌트
export default function MapLocationModal({ onSelect, onClose }) {
  const mapRef = useRef(null)
  const naverMap = useRef(null)
  const currentMarkerRef = useRef(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // geocoder 모듈이 로드될 때까지 기다리는 함수
    const waitForGeocoder = () => {
      if (window.naver && window.naver.maps && window.naver.maps.Service && mapRef.current) {
        initializeMap()
      } else {
        // 100ms 후 다시 시도
        setTimeout(waitForGeocoder, 100)
      }
    }

    // 네이버 지도 초기화 함수
    const initializeMap = () => {
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 15,
        mapTypeControl: false,
        logoControl: false,
        mapDataControl: false,
        scaleControl: false
      }

      naverMap.current = new window.naver.maps.Map(mapRef.current, mapOptions)

      // 지도 클릭 이벤트
      window.naver.maps.Event.addListener(naverMap.current, 'click', function (e) {
        const latlng = e.coord
        const lat = latlng.lat()
        const lng = latlng.lng()
        
        setSelectedLocation({ lat, lng })
        
        // 기존 마커 제거
        if (currentMarkerRef.current) {
          currentMarkerRef.current.setMap(null)
        }
        
        // 새 마커 생성
        const newMarker = new window.naver.maps.Marker({
          position: latlng,
          map: naverMap.current
        })
        currentMarkerRef.current = newMarker
        
        // 좌표 → 주소 요청
        window.naver.maps.Service.reverseGeocode({
          coords: latlng,
          orders: 'legalcode,addr,roadaddr'
        }, function (status, response) {
          if (status !== window.naver.maps.Service.Status.OK) {
            setAddress("주소를 불러올 수 없습니다.")
            return
          }

          const results = response.v2.results
          const legal = results.find(r => r.name === 'legalcode')

          if (!legal || !legal.region || !legal.region.area1 || !legal.region.area2) {
            setAddress("주소를 찾을 수 없습니다.")
            return
          }

          const area1 = legal.region.area1.name // 시도
          const area2 = legal.region.area2.name // 시군구

          setAddress(`${area1} ${area2}`)
        })
      })

      // 현재 위치로 이동
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const currentPos = new window.naver.maps.LatLng(
            position.coords.latitude, 
            position.coords.longitude
          )
          naverMap.current.setCenter(currentPos)
        })
      }
    }

    // geocoder 모듈 로드 대기 시작
    waitForGeocoder()
  }, [])

  // 주소 검색 함수
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    // geocoder 모듈이 로드되었는지 확인
    if (!window.naver || !window.naver.maps || !window.naver.maps.Service) {
      alert('지도 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    try {
      // 네이버 지도 API의 geocode 사용
      window.naver.maps.Service.geocode({
        query: searchQuery
      }, function (status, response) {
        if (status !== window.naver.maps.Service.Status.OK) {
          alert('검색 결과를 찾을 수 없습니다.')
          return
        }

        const results = response.v2.meta.totalCount
        if (results === 0) {
          alert('검색 결과를 찾을 수 없습니다.')
          return
        }

        const item = response.v2.addresses[0]
        const lat = parseFloat(item.y)
        const lng = parseFloat(item.x)
        
        // 지도 중심 이동
        const position = new window.naver.maps.LatLng(lat, lng)
        naverMap.current.setCenter(position)
        naverMap.current.setZoom(16)
        
        // 기존 마커 제거
        if (currentMarkerRef.current) {
          currentMarkerRef.current.setMap(null)
        }
        
        // 새 마커 생성
        const newMarker = new window.naver.maps.Marker({
          position: position,
          map: naverMap.current
        })
        currentMarkerRef.current = newMarker
        
        // 선택된 위치 업데이트
        setSelectedLocation({ lat, lng })
        
        // 주소 정보 설정 - 네이버 지도 API의 reverseGeocode로 정확한 주소 가져오기
        window.naver.maps.Service.reverseGeocode({
          coords: position,
          orders: 'legalcode,addr,roadaddr'
        }, function (status, response) {
          if (status !== window.naver.maps.Service.Status.OK) {
            setAddress(item.roadAddress || item.jibunAddress || searchQuery)
            return
          }

          const results = response.v2.results
          const legal = results.find(r => r.name === 'legalcode')

          if (!legal || !legal.region || !legal.region.area1 || !legal.region.area2) {
            setAddress(item.roadAddress || item.jibunAddress || searchQuery)
            return
          }

          const area1 = legal.region.area1.name // 시도
          const area2 = legal.region.area2.name // 시군구

          setAddress(`${area1} ${area2}`)
        })
      })
    } catch (error) {
      console.error('검색 실패:', error)
      alert('검색 중 오류가 발생했습니다.')
    }
  }

  const handleConfirm = () => {
    if (selectedLocation && address) {
      onSelect(selectedLocation.lat, selectedLocation.lng, address)
    }
  }

  // 모달 닫힐 때 마커 정리
  const handleClose = () => {
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setMap(null)
      currentMarkerRef.current = null
    }
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.mapModalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>위치 선택</h3>
          <button onClick={handleClose}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* 주소 검색 */}
        <div className={styles.searchContainer}>
          <div className={styles.searchInputGroup}>
            <input
              type="text"
              placeholder="주소를 입력하세요 (예: 서울시 강남구)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              <Icon name="search" size={16} />
            </button>
          </div>
        </div>
        
        <div className={styles.mapContainer}>
          <div ref={mapRef} className={styles.mapView}></div>
          <div className={styles.mapInstructions}>
            <p>주소를 검색하거나 지도를 터치하여 위치를 선택하세요</p>
          </div>
        </div>

        {selectedLocation && (
          <div className={styles.selectedLocationInfo}>
            <div className={styles.locationIcon}>
              <Icon name="location" size={16} />
            </div>
            <div className={styles.locationText}>
              <p>{address}</p>
            </div>
          </div>
        )}

        <div className={styles.mapModalButtons}>
          <button className={styles.cancelButton} onClick={handleClose}>
            취소
          </button>
          <button 
            className={styles.confirmButton} 
            onClick={handleConfirm}
            disabled={!selectedLocation}
          >
            선택
          </button>
        </div>
      </div>
    </div>
  )
}