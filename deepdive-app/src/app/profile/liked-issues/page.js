'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import { convertImageUrl, formatTimeAgo } from '@/lib/utils'
import { REGIONS } from '@/lib/constants/regions'
import styles from './liked-issues.module.scss'

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

export default function LikedIssuesPage() {
  const router = useRouter()
  const [likedIssues, setLikedIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('latest') // 'latest' or 'likes'

  useEffect(() => {
    const fetchLikedIssues = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          console.error('User ID not found')
          setError('로그인이 필요합니다.')
          setLoading(false)
          return
        }

        console.log('🔍 Fetching liked issues...')
        const response = await fetch(`/api/posts/liked?userId=${userId}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Liked issues data:', data)
          setLikedIssues(data)
        } else {
          console.error('❌ Failed to fetch liked issues:', response.status)
          setError('공감한 이슈를 불러오는 중 오류가 발생했습니다.')
        }
      } catch (error) {
        console.error('Error fetching liked issues:', error)
        setError('네트워크 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchLikedIssues()
  }, [])

  const handleIssueClick = (issueId) => {
    router.push(`/issues/${issueId}`)
  }

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
    
    // 정렬 로직
    const sortedIssues = [...likedIssues]
    if (newSortBy === 'latest') {
      sortedIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (newSortBy === 'likes') {
      sortedIssues.sort((a, b) => b.likeCount - a.likeCount)
    }
    setLikedIssues(sortedIssues)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>공감한 이슈를 불러오는 중...</p>
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
    <div className={styles.likedIssuesContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={styles.title}>공감한 이슈</h1>
        <div className={styles.placeholder}></div>
      </header>

      {/* 정렬 탭 */}
      <div className={styles.sortTabs}>
        <button 
          className={`${styles.sortTab} ${sortBy === 'latest' ? styles.active : ''}`}
          onClick={() => handleSortChange('latest')}
        >
          최신순
        </button>
        <button 
          className={`${styles.sortTab} ${sortBy === 'likes' ? styles.active : ''}`}
          onClick={() => handleSortChange('likes')}
        >
          공감순
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {likedIssues.length > 0 ? (
          <div className={styles.issuesList}>
            {likedIssues.map((issue) => {
              const statusTag = getStatusTag(issue.status)
              return (
                <div 
                  key={issue.id} 
                  className={styles.issueCard}
                  onClick={() => handleIssueClick(issue.id)}
                >
                  {/* 상태 태그 */}
                  <div className={`${styles.statusTag} ${statusTag.className}`}>
                    <Icon name={statusTag.icon} size={12} />
                    <span>{statusTag.text}</span>
                  </div>

                  {/* 카드 내용 */}
                  <div className={styles.cardContent}>
                    <div className={styles.textContent}>
                      <h3 className={styles.issueTitle}>{issue.title}</h3>
                      <p className={styles.issueDescription}>
                        {issue.content.length > 50 
                          ? `${issue.content.substring(0, 50)}...` 
                          : issue.content
                        }
                      </p>
                      <div className={styles.issueMeta}>
                        <span className={styles.issueTime}>
                          {formatTimeAgo(issue.createdAt)}
                        </span>
                        <span className={styles.issueLikes}>
                          공감수 {issue.likeCount}
                        </span>
                      </div>
                    </div>

                    {/* 썸네일 이미지 */}
                    {issue.imageUrl && (
                      <div className={styles.issueThumbnail}>
                        <img 
                          src={convertImageUrl(issue.imageUrl)} 
                          alt={issue.title}
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
            <div className={styles.emptyIcon}>❤️</div>
            <h3>아직 공감한 이슈가 없습니다</h3>
            <p>관심 있는 이슈에 공감해보세요!</p>
            <button 
              className={styles.exploreButton}
              onClick={() => router.push('/')}
            >
              이슈 둘러보기
            </button>
          </div>
        )}
      </main>
    </div>
  )
} 