'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import { convertImageUrl, formatTimeAgo } from '@/lib/utils'
import { REGIONS } from '@/lib/constants/regions'
import styles from './my-reports.module.scss'

// locationCode를 지역 이름으로 변환하는 함수
const getLocationNameFromCode = (locationCode) => {
  if (!locationCode) return '위치 정보 없음'
  
  // REGIONS 객체를 순회하면서 locationCode와 매칭되는 지역 찾기
  for (const [province, provinceData] of Object.entries(REGIONS)) {
    for (const [subRegion, code] of Object.entries(provinceData.sub_regions)) {
      if (code === locationCode) {
        return `${province} ${subRegion}`
      }
    }
  }
  
  // 매칭되는 지역이 없으면 원본 코드 반환
  return locationCode
}

// 상태에 따른 태그 스타일과 텍스트 반환
const getStatusTag = (status) => {
  switch (status) {
    case 'SOLVED':
      return {
        text: '해결됨',
        className: styles.solvedTag,
        icon: 'check'
      }
    case 'IN_PROGRESS':
      return {
        text: '진행중',
        className: styles.progressTag,
        icon: 'ongoing'
      }
    default:
      return {
        text: '제보됨',
        className: styles.reportedTag,
        icon: 'arrow-right'
      }
  }
}

export default function MyReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          console.error('User ID not found')
          setError('로그인이 필요합니다.')
          setLoading(false)
          return
        }

        console.log('🔍 Fetching my reports...')
        const response = await fetch(`/api/posts/mine?userId=${userId}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ My reports data:', data)
          setReports(data)
        } else {
          console.error('❌ Failed to fetch my reports:', response.status)
          setError('내 제보를 불러오는 중 오류가 발생했습니다.')
        }
      } catch (error) {
        console.error('Error fetching my reports:', error)
        setError('네트워크 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchMyReports()
  }, [])

  const handleReportClick = (reportId) => {
    router.push(`/issues/${reportId}`)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>내 제보를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>❌</div>
        <p>{error}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className={styles.myReportsContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={styles.title}>내 제보</h1>
        <div className={styles.placeholder}></div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {reports.length > 0 ? (
          <div className={styles.reportsList}>
            {reports.map((report) => {
              const statusTag = getStatusTag(report.status)
              return (
                <div 
                  key={report.id} 
                  className={styles.reportCard}
                  onClick={() => handleReportClick(report.id)}
                >
                  {/* 상태 태그 */}
                  <div className={`${styles.statusTag} ${statusTag.className}`}>
                    <Icon name={statusTag.icon} size={12} />
                    <span>{statusTag.text}</span>
                  </div>

                  {/* 카드 내용 */}
                  <div className={styles.cardContent}>
                    <div className={styles.textContent}>
                      <h3 className={styles.reportTitle}>{report.title}</h3>
                      <p className={styles.reportDescription}>
                        {report.content.length > 50 
                          ? `${report.content.substring(0, 50)}...` 
                          : report.content
                        }
                      </p>
                      <div className={styles.reportMeta}>
                        <span className={styles.reportTime}>
                          {formatTimeAgo(report.createdAt)}
                        </span>
                        <span className={styles.reportLikes}>
                          공감수 {report.likeCount}
                        </span>
                      </div>
                    </div>

                    {/* 썸네일 이미지 */}
                    {report.imageUrl && (
                      <div className={styles.reportThumbnail}>
                        <img 
                          src={convertImageUrl(report.imageUrl)} 
                          alt={report.title}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>아직 제보한 이슈가 없습니다</h3>
            <p>첫 번째 이슈를 제보해보세요!</p>
            <button 
              className={styles.reportButton}
              onClick={() => router.push('/report')}
            >
              이슈 제보하기
            </button>
          </div>
        )}
      </main>
    </div>
  )
} 