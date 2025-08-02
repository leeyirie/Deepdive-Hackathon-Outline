'use client'
import { useState, useEffect, useRef } from 'react'
import Icon from '@/components/icons/Icon'
import styles from './MapLocationModal.module.scss'

// 주소를 시/구/동까지만 파싱하는 함수
const parseAddress = (fullAddress) => {
  if (!fullAddress) return ''
  
  console.log('🔍 파싱할 주소:', fullAddress)
  
  // 정규식을 사용한 더 정확한 파싱
  const cityMatch = fullAddress.match(/([가-힣]+시)/)
  const districtMatch = fullAddress.match(/([가-힣]+구)/)
  const neighborhoodMatch = fullAddress.match(/([가-힣]+동|[가-힣]+읍|[가-힣]+면)/)
  
  const city = cityMatch ? cityMatch[1] : ''
  const district = districtMatch ? districtMatch[1] : ''
  const neighborhood = neighborhoodMatch ? neighborhoodMatch[1] : ''
  
  console.log('🔍 정규식 매칭 결과:', { city, district, neighborhood })
  
  // 결과 조합
  const result = [city, district, neighborhood].filter(Boolean).join(' ')
  console.log('🎯 최종 결과:', result)
  return result || fullAddress
}

// 지도 위치 선택 모달 컴포넌트
export default function MapLocationModal({ onSelect, onClose }) {
  const mapRef = useRef(null)
  const naverMap = useRef(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [currentMarker, setCurrentMarker] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // 네이버 지도 초기화
    if (window.naver && window.naver.maps && mapRef.current) {
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
      window.naver.maps.Event.addListener(naverMap.current, 'click', async (e) => {
        const lat = e.coord.lat()
        const lng = e.coord.lng()
        
        setSelectedLocation({ lat, lng })
        
        // 기존 마커 제거
        if (currentMarker) {
          currentMarker.setMap(null)
        }
        
        // 새 마커 생성
        const newMarker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(lat, lng),
          map: naverMap.current
        })
        setCurrentMarker(newMarker)
        
        // 역지오코딩으로 주소 가져오기
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ko`
          )
          
          if (response.ok) {
            const data = await response.json()
            const addressText = data.display_name || `위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)}`
            setAddress(addressText)
          }
        } catch (error) {
          console.error('주소 가져오기 실패:', error)
          setAddress(`위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)}`)
        }
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
  }, [currentMarker])

  // 주소 검색 함수
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      // Nominatim 지오코딩 API 사용
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=kr&limit=1&accept-language=ko`
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          const result = data[0]
          const lat = parseFloat(result.lat)
          const lng = parseFloat(result.lon)
          
          // 지도 중심 이동
          const position = new window.naver.maps.LatLng(lat, lng)
          naverMap.current.setCenter(position)
          naverMap.current.setZoom(16)
          
          // 기존 마커 제거
          if (currentMarker) {
            currentMarker.setMap(null)
          }
          
          // 새 마커 생성
          const newMarker = new window.naver.maps.Marker({
            position: position,
            map: naverMap.current
          })
          setCurrentMarker(newMarker)
          
          // 선택된 위치 업데이트
          setSelectedLocation({ lat, lng })
          setAddress(result.display_name || searchQuery)
        } else {
          alert('검색 결과를 찾을 수 없습니다.')
        }
      }
    } catch (error) {
      console.error('검색 실패:', error)
      alert('검색 중 오류가 발생했습니다.')
    }
  }

  const handleConfirm = () => {
    if (selectedLocation && address) {
      onSelect(selectedLocation.lat, selectedLocation.lng, parseAddress(address))
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.mapModalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>위치 선택</h3>
          <button onClick={onClose}>
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
              <p>{parseAddress(address)}</p>
            </div>
          </div>
        )}

        <div className={styles.mapModalButtons}>
          <button className={styles.cancelButton} onClick={onClose}>
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