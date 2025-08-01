import Icon from '@/components/icons/Icon'
import styles from './IssueCard.module.scss'

export default function IssueCard({ post }) {
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

  return (
    <div className={styles.issueCard}>
      <div className={styles.issueContent}>
        <div className={styles.statusTagTop}>
          {/* 백엔드 데이터: post.status (0: 진행중, 1: 해결됨) */}
          <span className={`${styles.statusTag} ${post.status === 1 ? styles.resolved : styles.inProgress}`}>
            <Icon name={post.status === 1 ? "resolve" : "ongoing"} size={14} />
            {post.status === 1 ? '해결됨' : '진행중'}
          </span>
        </div>
        <div className={styles.issueMain}>
          <div className={styles.issueText}>
            {/* 백엔드 데이터: post.title (기사 제목) */}
            <h3>{post.title}</h3>
            {/* 백엔드 데이터: post.content (기사 내용) */}
            <p className={styles.issueDescription}>
              {post.content}
            </p>
            <div className={styles.issueMeta}>
              {/* 백엔드 데이터: post.createdAt (작성일시) → 상대적 시간으로 변환 */}
              <span>{formatDate(post.createdAt)}</span>
              {/* 백엔드 데이터: post.likeCount (공감수) */}
              <span>공감수 {post.likeCount}</span>
            </div>
          </div>
          <div className={styles.issueImage}>
            {/* 백엔드 데이터: post.imageUrl (이미지 URL) */}
            {post.imageUrl ? (
              <img src={post.imageUrl} alt={post.title} className={styles.realImage} />
            ) : (
              <div className={styles.imagePlaceholder}>📷</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}