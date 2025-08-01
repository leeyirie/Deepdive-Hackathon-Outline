import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Icon from '@/components/icons/Icon'
import styles from './IssueCard.module.scss'

export default function IssueCard({ post }) {
  const router = useRouter()
  
  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays === 1) return '1일 전'
    if (diffDays <= 7) return `${diffDays}일 전`
    return date.toLocaleDateString('ko-KR')
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
            {/* 백엔드 데이터: post.createdAt (작성일시) → 상대적 시간으로 변환 */}
            <span>{formatDate(post?.createdAt || new Date())}</span>
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