'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import { convertImageUrl } from '@/lib/utils'
import { REGIONS } from '@/lib/constants/regions'
import styles from './issue-detail.module.scss'

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

export default function IssueDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedIssues, setRelatedIssues] = useState([])
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [error, setError] = useState(null)
  const [aiSummary, setAiSummary] = useState('')
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  // AI 요약 조회 함수
  const fetchAiSummary = async (postId) => {
    if (!postId) return
    
    try {
      setAiSummaryLoading(true)
      console.log('🤖 AI 요약 조회 중...')
      
      const response = await fetch(`/api/posts/${postId}/summary`)
      
      if (response.ok) {
        const data = await response.json()
        setAiSummary(data.summarizedContent)
        console.log('✅ AI 요약 조회 완료:', data.summarizedContent)
      } else {
        throw new Error(`AI 요약 조회 실패: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ AI 요약 조회 오류:', error)
      setAiSummary('AI 요약을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setAiSummaryLoading(false)
    }
  }

  useEffect(() => {
    const fetchIssueDetail = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          console.error('User ID not found')
          return
        }

        // 이슈 상세 정보 가져오기
        console.log(`🔍 Fetching issue detail for ID: ${params.id}`)
        const apiUrl = `/api/posts/${params.id}?userId=${userId}`
        console.log(`📡 API URL: ${apiUrl}`)
        
        const response = await fetch(apiUrl)
        console.log(`📡 Response status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
                  console.log('✅ Issue detail data:', data)
        console.log('📅 Created at:', data.createdAt)
        console.log('📅 Created at parsed:', new Date(data.createdAt))
        console.log('📅 Current time:', new Date())
        console.log('📅 Time difference (ms):', new Date().getTime() - new Date(data.createdAt).getTime())
        console.log('📅 Time difference (hours):', (new Date().getTime() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60))
        console.log('⏰ Formatted time:', formatTimeAgo(data.createdAt))
          
          setIssue(data)
          setIsLiked(data.liked || false)
          setLikeCount(data.likeCount || 0)
          
          // 상태가 'SOLVED'이면 해결됨으로 표시
          setIsSolved(data.status === 'SOLVED')
          
          // AI 요약 조회
          fetchAiSummary(params.id)
        
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to fetch issue detail:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          })
          
          if (response.status === 404) {
            console.error(`❌ Post with ID ${params.id} not found`)
            setError(`게시글을 찾을 수 없습니다. (ID: ${params.id})`)
          } else {
            setError(`게시글을 불러오는 중 오류가 발생했습니다. (${response.status})`)
          }
        }
      } catch (error) {
        console.error('Error fetching issue detail:', error)
        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
      } finally {
        setLoading(false)
      }
    }

    const fetchRelatedIssues = async () => {
      try {
        const userId = localStorage.getItem('userId')
        const response = await fetch(`/api/posts?userId=${userId}&sort=latest`)
        
        if (response.ok) {
          const data = await response.json()
          // 현재 이슈 제외하고 최대 3개만
          const filtered = (data || []).filter(item => item.id !== parseInt(params.id)).slice(0, 3)
          setRelatedIssues(filtered)
        }
      } catch (error) {
        console.error('Error fetching related issues:', error)
      }
    }

    if (params.id) {
      fetchIssueDetail()
      fetchRelatedIssues()
    }
  }, [params.id])

  const handleLike = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('로그인이 필요합니다.')
      return
    }

    if (isLikeLoading) return // 중복 클릭 방지

    setIsLikeLoading(true)
    
    try {
      // 🔥 공감해요 토글 로직: 현재 상태에 따라 POST/DELETE 선택
      const method = isLiked ? 'DELETE' : 'POST' // isLiked가 true면 DELETE, false면 POST
      console.log('🔥 공감해요 토글:', { isLiked, method, userId, postId: params.id })
      
      const response = await fetch('/api/likes', {
        method, // 🔥 첫 번째 클릭: POST 요청, 두 번째 클릭: DELETE 요청
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          postId: parseInt(params.id)
        }),
      })

      if (response.ok) {
        // 🔥 성공 시 UI 상태 업데이트
        setIsLiked(!isLiked) // 공감해요 상태 토글
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1) // 카운트 업데이트
        console.log('✅ 공감해요 토글 성공:', { newIsLiked: !isLiked, newCount: isLiked ? likeCount - 1 : likeCount + 1 })
        
        // 햅틱 피드백 (모바일)
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      } else {
        console.error('Failed to toggle like')
        alert('공감해요 처리에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleSolve = async () => {
  const userId = localStorage.getItem('userId')
  if (!userId) {
    alert('로그인이 필요합니다.')
    return
  }

  try {
    const method = isSolved ? 'DELETE' : 'POST'
    console.log('🔧 해결됐어요 토글 요청:', { method, userId, postId: params.id })

    const response = await fetch('/api/solve', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: parseInt(userId),
        postId: parseInt(params.id),
      }),
    })

    if (response.ok) {
      setIsSolved(!isSolved)
      console.log('✅ 해결됐어요 상태 변경 완료 →', !isSolved)

      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } else {
      console.error('❌ 해결됐어요 요청 실패:', response.status)
      alert('해결 여부 처리에 실패했습니다.')
    }
  } catch (error) {
    console.error('❌ 해결됐어요 네트워크 오류:', error)
    alert('네트워크 오류가 발생했습니다.')
  }
}


  const handleShare = async () => {
    try {
      const shareData = {
        title: `OUTLINE - ${issue?.title}`,
        text: `${issue?.content.substring(0, 100)}...`,
        url: window.location.href,
      }

      // 네이티브 공유 API 지원 확인
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        console.log('📱 네이티브 공유 API 사용')
        await navigator.share(shareData)
      } else {
        // 폴백: 클립보드 복사
        console.log('📋 클립보드 복사 폴백')
        await navigator.clipboard.writeText(window.location.href)
        
        // 성공 메시지 표시
        const toast = document.createElement('div')
        toast.textContent = '🔗 링크가 복사되었습니다!'
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 12px 24px;
          border-radius: 24px;
          font-size: 14px;
          z-index: 9999;
          animation: slideDown 0.3s ease;
        `
        
        // 애니메이션 CSS 추가
        const style = document.createElement('style')
        style.textContent = `
          @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
        `
        document.head.appendChild(style)
        document.body.appendChild(toast)
        
        setTimeout(() => {
          toast.remove()
          style.remove()
        }, 2000)
      }
    } catch (error) {
      console.error('공유 실패:', error)
      // 최종 폴백
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('링크가 복사되었습니다.')
      } catch (clipboardError) {
        console.error('클립보드 복사 실패:', clipboardError)
        alert('공유에 실패했습니다. 링크를 직접 복사해주세요.')
      }
    }
  }

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      // TODO: API 호출로 댓글 추가
      const newComment = {
        id: comments.length + 1,
        username: '익명',
        content: comment,
        createdAt: '방금 전'
      }
      setComments(prev => [newComment, ...prev])
      setComment('')
    }
  }

  const formatTimeAgo = (createdAt) => {
    if (!createdAt) return ''
    
    try {
      // 한국 시간대로 변환
      const created = new Date(createdAt)
      
      // 유효한 날짜인지 확인
      if (isNaN(created.getTime())) {
        console.warn('Invalid date format:', createdAt)
        return ''
      }
      
      // 현재 시간 (한국 시간대)
      const now = new Date()
      
      // 시간 차이 계산 (밀리초)
      const diffMs = now.getTime() - created.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffMonths = Math.floor(diffDays / 30)
      const diffYears = Math.floor(diffDays / 365)
      
      if (diffMs < 0) return '방금 전' // 미래 시간인 경우
      if (diffMins < 1) return '방금 전'
      if (diffMins < 60) return `${diffMins}분 전`
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 30) return `${diffDays}일 전`
      if (diffMonths < 12) return `${diffMonths}개월 전`
      return `${diffYears}년 전`
    } catch (error) {
      console.error('Error formatting time:', error)
      return ''
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>이슈를 불러오는 중...</p>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>❌</div>
        <p>{error || '이슈를 찾을 수 없습니다.'}</p>  
        <div className={styles.errorHelp}>
          <p>다음을 확인해보세요:</p>
          <ul>
            <li>올바른 게시글 링크인지 확인</li>
            <li>게시글이 삭제되었을 수 있음</li>
            <li>네트워크 연결 상태 확인</li>
          </ul>
        </div>
        <button onClick={() => router.back()} className={styles.backButton}>
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className={styles.issueDetailContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </button>
        <button className={styles.shareButton} onClick={handleShare}>
          <Icon name="share" size={24} />
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 이슈 정보 */}
        <section className={styles.issueInfo}>
          <h1 className={styles.title}>{issue.title}</h1>
          {/* <p className={styles.subtitle}>{issue.content}</p> //서브타이틀 부분 삭제제 */}
          <div className={styles.timeInfo}>
            <Icon name="location" size={16} />
            <span>{getLocationNameFromCode(issue.locationCode)} · {formatTimeAgo(issue.createdAt)}</span>
          </div>
        </section>

        {/* 이슈 이미지 */}
        {issue.imageUrl && typeof issue.imageUrl === 'string' && issue.imageUrl.trim() !== '' && (
          <section className={styles.issueImage}>
            <img src={convertImageUrl(issue.imageUrl)} alt={issue.title} />
          </section>
        )}

        {/* AI 요약 */}
        <section className={styles.aiSummary}>
          <div className={styles.aiHeader}>
            <Icon name="ai" size={20} />
            <span>AI 요약</span>
            {aiSummaryLoading && (
              <div className={styles.aiLoadingSpinner}></div>
            )}
          </div>
          <p className={styles.aiContent}>
            {aiSummaryLoading ? (
              <span className={styles.aiLoadingText}>
                AI가 이슈 내용을 분석하여 요약을 생성하고 있습니다...
              </span>
            ) : aiSummary ? (
              aiSummary
            ) : (
              '이슈 내용을 분석 중입니다. 잠시만 기다려주세요.'
            )}
          </p>
        </section>

        {/* AI 요약 공감 통계 (바깥쪽) */}
        <section className={styles.aiStats}>
          {likeCount}명이 공감했어요
        </section>

        {/* 액션 버튼 */}
        <section className={styles.actionButtons}>
          <button 
            className={`${styles.actionBtn} ${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
            onClick={handleLike}
            disabled={isLikeLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 14C4 12.25 4.41667 10.6917 5.25 9.325C6.08333 7.95833 7 6.80833 8 5.875C9 4.94167 9.91667 4.22917 10.75 3.7375L12 3V6.3C12 6.91667 12.2083 7.40417 12.625 7.7625C13.0417 8.12083 13.5083 8.3 14.025 8.3C14.3083 8.3 14.5792 8.24167 14.8375 8.125C15.0958 8.00833 15.3333 7.81667 15.55 7.55L16 7C17.2 7.7 18.1667 8.67083 18.9 9.9125C19.6333 11.1542 20 12.5167 20 14C20 15.4667 19.6417 16.8042 18.925 18.0125C18.2083 19.2208 17.2667 20.175 16.1 20.875C16.3833 20.475 16.6042 20.0375 16.7625 19.5625C16.9208 19.0875 17 18.5833 17 18.05C17 17.3833 16.875 16.7542 16.625 16.1625C16.375 15.5708 16.0167 15.0417 15.55 14.575L12 11.1L8.475 14.575C7.99167 15.0583 7.625 15.5917 7.375 16.175C7.125 16.7583 7 17.3833 7 18.05C7 18.5833 7.07917 19.0875 7.2375 19.5625C7.39583 20.0375 7.61667 20.475 7.9 20.875C6.73333 20.175 5.79167 19.2208 5.075 18.0125C4.35833 16.8042 4 15.4667 4 14ZM12 13.9L14.125 15.975C14.4083 16.2583 14.625 16.575 14.775 16.925C14.925 17.275 15 17.65 15 18.05C15 18.8667 14.7083 19.5625 14.125 20.1375C13.5417 20.7125 12.8333 21 12 21C11.1667 21 10.4583 20.7125 9.875 20.1375C9.29167 19.5625 9 18.8667 9 18.05C9 17.6667 9.075 17.2958 9.225 16.9375C9.375 16.5792 9.59167 16.2583 9.875 15.975L12 13.9Z" fill="currentColor"/>
            </svg>
            <span>{isLikeLoading ? '처리중...' : '공감해요'}</span>
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.solveBtn} ${isSolved ? styles.solved : ''}`}
            onClick={handleSolve}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>해결됐어요</span>
          </button>
        </section>

        {/* 댓글 섹션 */}
        <section className={styles.commentsSection}>
          <h3 className={styles.commentsTitle}>의견 {comments.length}</h3>
          
          {/* 댓글 입력 */}
          <div className={styles.commentInput}>
            <input
              type="text"
              placeholder="의견을 자유롭게 입력해주세요"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
            />
          </div>

          {/* 댓글 목록 */}
          <div className={styles.commentsList}>
            {comments.map((commentItem) => (
              <div key={commentItem.id} className={styles.commentItem}>
                <div className={styles.commentAvatar}>
                  <Icon name="my-false" size={32} />
                </div>
                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <span className={styles.commentUsername}>{commentItem.username}</span>
                    <span className={styles.commentTime}>{commentItem.createdAt}</span>
                  </div>
                  <p className={styles.commentText}>{commentItem.content}</p>
                </div>
              </div>
            ))}
            
            {comments.length > 3 && (
              <button className={styles.loadMoreComments}>더 보기</button>
            )}
          </div>
        </section>

        {/* 이 시간 다른 이슈 */}
        <section className={styles.relatedIssues}>
          <h3 className={styles.relatedTitle}>이 시간 다른 이슈</h3>
          <div className={styles.relatedList}>
            {relatedIssues.map((relatedIssue) => (
              <div 
                key={relatedIssue.id} 
                className={styles.relatedItem}
                onClick={() => router.push(`/issues/${relatedIssue.id}`)}
              >
                <div className={styles.relatedContent}>
                  <h4 className={styles.relatedItemTitle}>{relatedIssue.title}</h4>
                  <p className={styles.relatedItemMeta}>
                    {getLocationNameFromCode(relatedIssue.locationCode)} · {formatTimeAgo(relatedIssue.createdAt)}
                  </p>
                </div>
                {relatedIssue.imageUrl && typeof relatedIssue.imageUrl === 'string' && relatedIssue.imageUrl.trim() !== '' && (
                  <div className={styles.relatedImage}>
                    <img src={convertImageUrl(relatedIssue.imageUrl)} alt={relatedIssue.title} />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {relatedIssues.length > 0 && (
            <button className={styles.loadMoreRelated}>더 보기</button>
          )}
        </section>
      </main>
    </div>
  )
}
