'use client'
import { useState } from 'react'
import Icon from './icons/Icon'
import styles from './InterestRegionModal.module.scss'

export default function InterestRegionModal({ isOpen, onClose, onAddRegion }) {
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDetailRegion, setSelectedDetailRegion] = useState('')

  // 시/도 목록
  const provinces = [
    '강원', '대전', '충북', '충남', '세종',
    '광주', '전북', '전남', '울산', '부산',
    '대구', '경북', '경남', '제주'
  ]

  // 상세 지역 데이터 (시/도별 하위 지역)
  const detailRegions = {
    '강원': [
      '양양/속초/고성', '강릉', '동해/삼척',
      '태백/영월/정선', '평창', '원주/횡성',
      '철원', '춘천/홍천'
    ],
    '대전': ['유성구/대덕구', '서구', '중구/동구'],
    '충북': ['청주', '제천/단양', '옥천'],
    '충남': ['천안/아산', '당진/서산/태안', '공주/계룡', '보령'],
    '세종': ['세종특별자치시'],
    '광주': ['수원/첨단/광산', '북구', '남구', '동구', '서구'],
    '전북': ['전주', '군산/익산', '김제/부안/정읍', '남원/임실'],
    '전남': ['여수/순천/광양', '장성/담양', '영암/강진/장흥', '나주/화순', '목포/무안/함평', '해남/진도', '곡성/구례'],
    '울산': ['남구/중구', '동구/북구', '울주군'],
    '부산': ['서면', '해운대', '광안리/수영', '기장', '부산역/동구', '동래', '남포/중구/영도', '사상/하단/서구', '연제/연산', '경성대/부경대/남구', '부산대/금정구', '덕천/북구', '명지/강서구'],
    '대구': ['동성로/중구', '범어/수성구', '서구/성서/달성', '팔공산/동구', '앞산/남구', '북구'],
    '경북': ['경주', '구미/김천/칠곡', '문경/상주', '포항', '안동/영주'],
    '경남': ['창녕/의령/함안', '남해', '장유/김해', '진주/사천', '통영/거제', '마산/창원/진해', '밀양/양산'],
    '제주': ['제주시', '서귀포시']
  }

  // 시/도 선택 핸들러
  const handleProvinceSelect = (province) => {
    setSelectedProvince(province)
    setSelectedDetailRegion('') // 상세 지역 초기화
  }

  // 상세 지역 선택 핸들러
  const handleDetailRegionSelect = (detailRegion) => {
    setSelectedDetailRegion(detailRegion)
  }

  // 추가하기 핸들러
  const handleAdd = () => {
    if (selectedProvince && selectedDetailRegion) {
      const fullRegionName = `${selectedProvince} ${selectedDetailRegion}`
      onAddRegion(fullRegionName)
      onClose()
      // 상태 초기화
      setSelectedProvince('')
      setSelectedDetailRegion('')
    }
  }

  // 모달 닫기 핸들러
  const handleClose = () => {
    onClose()
    // 상태 초기화
    setSelectedProvince('')
    setSelectedDetailRegion('')
  }

  // 추가하기 버튼 활성화 여부
  const isAddButtonEnabled = selectedProvince && selectedDetailRegion

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 드래그 핸들 */}
        <div className={styles.dragHandle} />
        
        {/* 모달 헤더 */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>관심 지역 추가</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        
        {/* 시/도 선택 섹션 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>시/도</h3>
          <div className={styles.regionGrid}>
            {provinces.map((province) => (
              <button
                key={province}
                className={`${styles.regionButton} ${selectedProvince === province ? styles.selected : ''}`}
                onClick={() => handleProvinceSelect(province)}
              >
                {province}
              </button>
            ))}
          </div>
        </div>

        {/* 상세 지역 선택 섹션 (시/도가 선택된 경우에만 표시) */}
        {selectedProvince && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>상세 지역</h3>
            <div className={styles.regionGrid}>
              {detailRegions[selectedProvince]?.map((detailRegion) => (
                <button
                  key={detailRegion}
                  className={`${styles.regionButton} ${selectedDetailRegion === detailRegion ? styles.selected : ''}`}
                  onClick={() => handleDetailRegionSelect(detailRegion)}
                >
                  {detailRegion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 추가하기 버튼 */}
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.addButton} ${isAddButtonEnabled ? styles.enabled : ''}`}
            onClick={handleAdd}
            disabled={!isAddButtonEnabled}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  )
} 