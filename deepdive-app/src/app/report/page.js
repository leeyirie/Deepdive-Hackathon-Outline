'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import MapLocationModal from '@/components/MapLocationModal'
import styles from './report.module.scss'

export default function ReportPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    locationCode: '',
    latitude: null,
    longitude: null
  })
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 폼 입력 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasUnsavedChanges(true)
  }

  // 뒤로가기 핸들러
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowExitModal(true)
    } else {
      router.back()
    }
  }

  // 나가기 확인
  const handleExitConfirm = () => {
    setShowExitModal(false)
    router.back()
  }

  // 나가기 취소
  const handleExitCancel = () => {
    setShowExitModal(false)
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    
    // 첫 번째 파일만 처리 (1개만 허용)
    if (files.length > 0 && images.length === 0) {
      const file = files[0]
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name
        }
        
        setImages([newImage]) // 기존 이미지 대체
        setHasUnsavedChanges(true)
      }
      reader.readAsDataURL(file)
    }
    
    // input 초기화
    event.target.value = ''
  }

  // 이미지 삭제 핸들러
  const handleImageDelete = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }



  // 지도에서 위치 선택 핸들러
  const handleMapLocationSelect = async (lat, lng, address) => {
    // 주소에서 도/시/군 추출
    const provinceMatch = address.match(/([가-힣]+도)/)
    const cityMatch = address.match(/([가-힣]+시)/)
    const countyMatch = address.match(/([가-힣]+군)/)
    
    const province = provinceMatch ? provinceMatch[1] : ''
    const city = cityMatch ? cityMatch[1] : ''
    const county = countyMatch ? countyMatch[1] : ''
    
    // 도 + 시/군 조합 (예: "전북 전주시", "경북 포항시")
    let locationCode = ''
    if (province && (city || county)) {
      locationCode = `${province} ${city || county}`
    } else if (city || county) {
      locationCode = city || county
    } else {
      locationCode = 'CUSTOM'
    }
    
    console.log('📍 선택된 위치:', { address, locationCode })
    
    setFormData(prev => ({
      ...prev,
      location: address,
      locationCode: locationCode,
      latitude: lat,
      longitude: lng
    }))
    setShowMapModal(false)
    setHasUnsavedChanges(true)
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

      // 이미지 업로드 처리 - 백엔드로 직접 업로드
      let imageUrls = []
      if (images.length > 0) {
        try {
          // FormData를 사용하여 이미지 파일들을 백엔드로 전송
          const uploadFormData = new FormData()
          images.forEach((img) => {
            uploadFormData.append('files', img.file) // 백엔드 API에 맞춰 'files'로 key 설정
          })
          
          // 프론트엔드 프록시를 통한 업로드
          const uploadResponse = await fetch('/api/files/upload', {
            method: 'POST',
            body: uploadFormData
          })
          
          if (uploadResponse.ok) {
            const uploadedUrls = await uploadResponse.json()
            imageUrls = uploadedUrls || []
            console.log('✅ 이미지 업로드 성공:', imageUrls)
            console.log('📝 업로드된 URL 타입:', typeof imageUrls)
            console.log('📝 업로드된 URL 배열:', Array.isArray(imageUrls) ? imageUrls : '배열이 아님')
          } else {
            const errorText = await uploadResponse.text()
            console.error('❌ 이미지 업로드 실패:', uploadResponse.status, errorText)
            // 이미지 업로드 실패 시에도 게시글은 등록
            imageUrls = []
          }
        } catch (error) {
          console.error('❌ 이미지 업로드 오류:', error)
          // 이미지 업로드 오류 시에도 게시글은 등록
          imageUrls = []
        }
      }

             // API 요청 데이터 구성
       const requestData = {
         userId: parseInt(userId),
         title: formData.title.trim(),
         content: formData.content.trim(),
         imageUrl: imageUrls, // 배열 그대로 전송
         locationCode: formData.locationCode,
         latitude: formData.latitude,
         longitude: formData.longitude,
         status: 0 // 기본 상태
       }

                           console.log('📤 제보 등록 요청:', requestData)
        console.log('📝 imageUrl 필드 값:', requestData.imageUrl)
        console.log('📝 imageUrl 타입:', typeof requestData.imageUrl)
 
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
        
        // 성공 플래그 설정 후 즉시 홈으로 이동
        setHasUnsavedChanges(false)
        localStorage.setItem('showSuccessToast', 'true')
        
        // 새로 생성된 post ID 저장 (바로가기 링크용)
        if (result.value && result.value.id) {
          localStorage.setItem('newPostId', result.value.id.toString())
        }
        
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
          onClick={handleBackClick}
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
            onClick={() => setShowMapModal(true)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon name="location" size={20} />
              <span className={formData.location ? styles.selected : ''}>
                {formData.location || '위치를 선택하세요'}
              </span>
            </div>
            <Icon name="gps" size={16} />
          </button> 
        </div>

        {/* 이미지 업로드 */}
        <div className={styles.inputGroup}>
          <div className={styles.imageUploadSection}>
                         <button
               className={styles.imageUploadButton}
               onClick={() => fileInputRef.current?.click()}
               disabled={images.length >= 1}
             >
               <Icon name="camera" size={24} />
               <span>{images.length}/1</span>
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

      {/* 지도 위치 선택 모달 */}
      {showMapModal && (
        <MapLocationModal
          onSelect={handleMapLocationSelect}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* 나가기 확인 모달 */}
      {showExitModal && (
        <ExitConfirmModal
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
        />
      )}


    </div>
  )
}



// 나가기 확인 모달 컴포넌트
function ExitConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.exitModalContent}>
        <h3>정말로 나가시겠습니까?</h3>
        <p>작성중인 내용은 저장되지 않습니다.</p>
        <p>작성중인 내용은 저장되지 않습니다.</p>
        <div className={styles.exitModalButtons}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            닫기
          </button>
          <button 
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  )
}

