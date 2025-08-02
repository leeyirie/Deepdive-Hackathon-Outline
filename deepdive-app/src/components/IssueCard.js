import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/icons/Icon'
import styles from './IssueCard.module.scss'

export default function IssueCard({ post }) {
  const router = useRouter()
  
  // 날짜 포맷 함수 (한국 시간대 기준)
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    try {
      // 한국 시간대로 변환
      const date = new Date(dateString)
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format in IssueCard:', dateString)
        return ''
      }
      
      // 현재 시간 (한국 시간대)
      const now = new Date()
      
      // 시간 차이 계산 (밀리초)
      const diffTime = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffTime / (1000 * 60))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffMonths = Math.floor(diffDays / 30)
      const diffYears = Math.floor(diffDays / 365)
      
      // 디버깅을 위한 로그
      console.log('🕐 IssueCard time debug:', {
        original: dateString,
        parsed: date,
        now: now,
        diffMs: diffTime,
        diffHours: diffHours,
        result: diffTime < 0 ? '방금 전' : 
                diffMins < 1 ? '방금 전' :
                diffMins < 60 ? `${diffMins}분 전` :
                diffHours < 24 ? `${diffHours}시간 전` :
                diffDays < 30 ? `${diffDays}일 전` :
                diffMonths < 12 ? `${diffMonths}개월 전` :
                `${diffYears}년 전`
      })
      
      if (diffTime < 0) return '방금 전' // 미래 시간인 경우
      if (diffMins < 1) return '방금 전'
      if (diffMins < 60) return `${diffMins}분 전`
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 30) return `${diffDays}일 전`
      if (diffMonths < 12) return `${diffMonths}개월 전`
      return `${diffYears}년 전`
    } catch (error) {
      console.error('Error formatting date in IssueCard:', error)
      return ''
    }
  }

  const handleClick = (e) => {
    // 이벤트 버블링 방지
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🔍 IssueCard 클릭:', { postId: post?.id, postTitle: post?.title })
    
    if (post && post.id) {
      console.log('🚀 페이지 이동 시도:', `/issues/${post.id}`)
      router.push(`/issues/${post.id}`)
    } else {
      console.error('❌ post 또는 post.id가 없습니다:', post)
    }
  }

  const handleTouchStart = (e) => {
    // 터치 시작 시 기본 동작 방지
    e.preventDefault()
    e.stopPropagation()
    console.log('📱 터치 시작:', post?.id)
  }

  const handleTouchEnd = (e) => {
    // 터치 종료 시 클릭 이벤트 발생
    e.preventDefault()
    e.stopPropagation()
    console.log('📱 터치 종료:', post?.id)
    handleClick(e)
  }

  const handleTouchMove = (e) => {
    // 터치 이동 시 스크롤 방지 (필요시)
    // e.preventDefault()
  }

  const handleKeyDown = (e) => {
    // 키보드 접근성 지원
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      handleClick(e)
    }
  }

  // 터치 이벤트가 발생하지 않을 경우를 대비한 추가 처리
  const handleMouseDown = (e) => {
    console.log('🖱️ 마우스 다운:', post?.id)
  }

  const handleMouseUp = (e) => {
    console.log('🖱️ 마우스 업:', post?.id)
  }

  // Link 컴포넌트를 사용한 대안 네비게이션
  const cardContent = (
    <div className={styles.issueContent}>
      <div className={styles.statusTagTop}>
        {/* 백엔드 데이터: post.status (0: 진행중, 1: 해결됨) */}
        <span className={`${styles.statusTag} ${post?.status === 1 ? styles.resolved : styles.inProgress}`}>
          <Icon name={post?.status === 1 ? "resolve" : "ongoing"} size={14} />
          {post?.status === 1 ? '해결됨' : '진행중'}
        </span>
      </div>
      <div className={styles.issueMain}>
        <div className={styles.issueText}>
          {/* 백엔드 데이터: post.title (기사 제목) */}
          <h3>{post?.title || '제목 없음'}</h3>
          {/* 백엔드 데이터: post.content (기사 내용) */}
          <p className={styles.issueDescription}>
            {post?.content || '내용 없음'}
          </p>
          <div className={styles.issueMeta}>
            {/* 백엔드 데이터: post.createdAt (작성일시) → 상대적 시간만 표시 */}
            <span>{formatDate(post?.createdAt)}</span>
            {/* 백엔드 데이터: post.likeCount (공감수) */}
            <span>공감수 {post?.likeCount || 0}</span>
          </div>
        </div>
        <div className={styles.issueImage}>
          {/* 백엔드 데이터: post.imageUrl (이미지 URL) */}
          {post?.imageUrl ? (
            <img src={post.imageUrl} alt={post.title} className={styles.realImage} />
          ) : (
            <div className={styles.imagePlaceholder}>📷</div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Link 
      href={`/issues/${post?.id || ''}`}
      className={styles.issueCard}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${post?.title || '이슈'} 상세보기`}
      data-post-id={post?.id}
    >
      {cardContent}
    </Link>
  )
}