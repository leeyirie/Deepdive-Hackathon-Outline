'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import styles from './report.module.scss'

export default function ReportPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    locationCode: ''
  })
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

  // 폼 입력 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    files.forEach(file => {
      if (images.length >= 3) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name
        }
        
        setImages(prev => {
          if (prev.length >= 3) return prev
          return [...prev, newImage]
        })
      }
      reader.readAsDataURL(file)
    })
    
    // input 초기화
    event.target.value = ''
  }

  // 이미지 삭제 핸들러
  const handleImageDelete = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  // 위치 선택 핸들러
  const handleLocationSelect = (location, locationCode) => {
    setFormData(prev => ({
      ...prev,
      location,
      locationCode
    }))
    setShowLocationModal(false)
  }

  // 폼 유효성 검사
  const isFormValid = () => {
    return formData.title.trim() && 
           formData.content.trim() && 
           formData.location.trim() &&
           !isSubmitting
  }

  // 제보 등록 핸들러
  const handleSubmit = async () => {
    if (!isFormValid()) return
    
    try {
      setIsSubmitting(true)
      
      // 로그인 사용자 정보 확인
      const userId = localStorage.getItem('userId')
      if (!userId) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
      }

      // 이미지 업로드 처리 (실제로는 서버에 업로드해야 함)
      // 현재는 더미 URL 사용
      const imageUrls = images.map((img, index) => 
        `https://example.com/images/${Date.now()}_${index}.jpg`
      )

      // API 요청 데이터 구성
      const requestData = {
        userId: parseInt(userId),
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageURL: imageUrls.join(','), // 콤마로 구분된 문자열
        locationCode: formData.locationCode,
        status: 0 // 기본 상태
      }

      console.log('📤 제보 등록 요청:', requestData)

      // API 호출
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ 제보 등록 성공:', result)
        
        // 성공 알림
        alert('제보가 성공적으로 등록되었습니다!')
        
        // 홈으로 이동
        router.push('/home')
      } else {
        throw new Error(`제보 등록 실패: ${response.status}`)
      }

    } catch (error) {
      console.error('❌ 제보 등록 오류:', error)
      alert('제보 등록 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.reportContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button 
          className={styles.closeButton}
          onClick={() => router.push('/home')}
        >
          <Icon name="close" size={24} />
        </button>
        <h1 className={styles.title}>제보 등록</h1>
        <div className={styles.headerSpacer}></div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 제목 입력 */}
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={styles.titleInput}
            maxLength={100}
          />
        </div>

        {/* 내용 입력 */}
        <div className={styles.inputGroup}>
          <textarea
            placeholder="자세한 내용을 입력하세요"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className={styles.contentTextarea}
            rows={8}
            maxLength={1000}
          />
        </div>

        {/* 위치 선택 */}
        <div className={styles.inputGroup}>
          <button
            className={styles.locationButton}
            onClick={() => setShowLocationModal(true)}
          >
            <Icon name="location" size={20} />
            <span className={formData.location ? styles.selected : ''}>
              {formData.location || '위치를 선택하세요'}
            </span>
            <Icon name="chevron-down" size={16} />
          </button>
        </div>

        {/* 이미지 업로드 */}
        <div className={styles.inputGroup}>
          <div className={styles.imageUploadSection}>
            <button
              className={styles.imageUploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 3}
            >
              <Icon name="camera" size={24} />
              <span>{images.length}/3</span>
            </button>
            
            {images.map((image) => (
              <div key={image.id} className={styles.imagePreview}>
                <img src={image.preview} alt={image.name} />
                <button
                  className={styles.imageDeleteButton}
                  onClick={() => handleImageDelete(image.id)}
                >
                  <Icon name="image-delete" size={16} />
                </button>
              </div>
            ))}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className={styles.hiddenFileInput}
          />
        </div>
      </main>

      {/* 하단 등록 버튼 */}
      <footer className={styles.footer}>
        <button
          className={`${styles.submitButton} ${isFormValid() ? styles.active : ''}`}
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          {isSubmitting ? '등록 중...' : '등록하기'}
        </button>
      </footer>

      {/* 위치 선택 모달 */}
      {showLocationModal && (
        <LocationModal
          onSelect={handleLocationSelect}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </div>
  )
}

// 위치 선택 모달 컴포넌트
function LocationModal({ onSelect, onClose }) {
  const locations = [
    { name: '서울특별시', code: 'SEOUL' },
    { name: '부산광역시', code: 'BUSAN' },
    { name: '대구광역시', code: 'DAEGU' },
    { name: '인천광역시', code: 'INCHEON' },
    { name: '광주광역시', code: 'GWANGJU' },
    { name: '대전광역시', code: 'DAEJEON' },
    { name: '울산광역시', code: 'ULSAN' },
    { name: '세종특별자치시', code: 'SEJONG' },
    { name: '경기도', code: 'GYEONGGI' },
    { name: '강원도', code: 'GANGWON' },
    { name: '충청북도', code: 'CHUNGBUK' },
    { name: '충청남도', code: 'CHUNGNAM' },
    { name: '전라북도', code: 'JEONBUK' },
    { name: '전라남도', code: 'JEONNAM' },
    { name: '경상북도', code: 'GYEONGBUK' },
    { name: '경상남도', code: 'GYEONGNAM' },
    { name: '제주특별자치도', code: 'JEJU' }
  ]

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>위치 선택</h3>
          <button onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className={styles.locationList}>
          {locations.map((location) => (
            <button
              key={location.code}
              className={styles.locationItem}
              onClick={() => onSelect(location.name, location.code)}
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}