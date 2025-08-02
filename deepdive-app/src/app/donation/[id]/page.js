'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import styles from './donation-detail.module.scss'

export default function DonationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [donation, setDonation] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  const mockDonation = {
    id: params.id,
    title: "충남 폭우 피해자 기부 모음",
    location: "충남 천안시",
    timeAgo: "24분 전",
    description: "충남 폭우 피해 주민을 위한 긴급 모금에 함께해 주세요.",
    images: [
      "/img/donation-flood.jpg" // 실제 이미지 경로로 변경 필요
    ],
    goal: 3000000, // 300만원
    current: 990000, // 99만원 (33%)
    comments: [
      { id: 1, user: "임병준", timeAgo: "2분 전", content: "안타깝네요.." },
      { id: 2, user: "요한이", timeAgo: "2분 전", content: "기부했습니다." },
      { id: 3, user: "유진", timeAgo: "2분 전", content: "저도 기부해야겠어요" }
    ]
  }

  useEffect(() => {
    // 실제로는 API 호출
    setTimeout(() => {
      setDonation(mockDonation)
      setComments(mockDonation.comments)
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: "사용자",
        timeAgo: "방금 전",
        content: newComment.trim()
      }
      setComments([comment, ...comments])
      setNewComment('')
    }
  }

  const calculateProgress = () => {
    if (!donation) return 0
    return Math.round((donation.current / donation.goal) * 100)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>기부 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!donation) {
    return (
      <div className={styles.errorContainer}>
        <p>기부 정보를 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className={styles.donationContainer}>
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={styles.title}>기부하기</h1>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 제목 및 위치 정보 */}
        <div className={styles.titleSection}>
          <h2 className={styles.donationTitle}>{donation.title}</h2>
          <div className={styles.locationInfo}>
            <Icon name="location" size={16} />
            <span>{donation.location} {donation.timeAgo}</span>
          </div>
        </div>

        {/* 이미지 캐러셀 */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            <img 
              src="/img/rain.png"
            />
            <div className={styles.imageSource}>
              &lt;사진: {donation.imageSource}&gt;
            </div>
          </div>
          
          {/* 이미지 인디케이터 */}
          {donation.images.length > 1 && (
            <div className={styles.imageIndicators}>
              {donation.images.map((_, index) => (
                <div
                  key={index}
                  className={`${styles.indicator} ${index === currentImageIndex ? styles.active : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 기부 설명 */}
        <div className={styles.descriptionSection}>
          <p className={styles.description}>{donation.description}</p>
        </div>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 의견 섹션 */}
        <div className={styles.commentsSection}>
          <h3 className={styles.commentsTitle}>의견 {comments.length}</h3>
          
          {/* 댓글 입력 */}
          <form onSubmit={handleSubmitComment} className={styles.commentForm}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="의견을 자유롭게 입력해주세요"
              className={styles.commentInput}
            />
          </form>

          {/* 댓글 목록 */}
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <span className={styles.userName}>{comment.user}</span>
                  <span className={styles.commentTime}>{comment.timeAgo}</span>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 기부 진행률 */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              {Math.floor(donation.goal / 10000)}만원 목표 {calculateProgress()}%
            </span>
          </div>
        </div>
      </main>

      {/* 기부하기 버튼 */}
      <div className={styles.donateButtonContainer}>
        <button className={styles.donateButton}>
          기부하기
        </button>
      </div>
    </div>
  )
} 