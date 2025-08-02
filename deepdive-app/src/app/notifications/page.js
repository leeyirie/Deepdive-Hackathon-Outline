'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import { fetchNotifications } from '@/lib/services/notifications'
import styles from './notifications.module.scss'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (!userId) {
          setError('로그인이 필요합니다.')
          setLoading(false)
          return
        }

        // 임시 데이터 (실제로는 API에서 가져올 예정)
        const mockNotifications = [
          {
            id: 1,
            message: "제보하신 \"경북 안동 대형 산불\" 관련 내용이 실제 정책에 반영되었습니다.",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2시간 전
          },
          {
            id: 2,
            message: "제보하신 \"강원 춘천 정전\" 관련 내용이 기관에 제보되었습니다.",
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5시간 전
          },
          {
            id: 3,
            message: "제보하신 \"전북 전주 질산 누출\" 이슈가 해결되었습니다.",
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5시간 전
          }
        ]

        console.log('🔔 알림 데이터:', mockNotifications)
        setNotifications(mockNotifications)
      } catch (error) {
        console.error('알림 로딩 오류:', error)
        setError('알림을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const formatTimeAgo = (createdAt) => {
    if (!createdAt) return ''
    
    try {
      const date = new Date(createdAt)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffMonths = Math.floor(diffDays / 30)
      const diffYears = Math.floor(diffDays / 365)
      
      if (diffMs < 0) return '방금 전'
      if (diffMins < 1) return '방금 전'
      if (diffMins < 60) return `${diffMins}분 전`
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 30) return `${diffDays}일 전`
      if (diffMonths < 12) return `${diffMonths}개월 전`
      return `${diffYears}년 전`
    } catch (error) {
      return '방금 전'
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>알림을 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className={styles.notificationsContainer}>
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={styles.title}>알림</h1>
      </header>

      {/* 알림 목록 */}
      <main className={styles.mainContent}>
        {notifications.length > 0 ? (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div key={notification.id} className={styles.notificationItem}>
                <div className={styles.notificationContent}>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <span className={styles.notificationTime}>
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                {/* 이미지가 있는 경우에만 표시 */}
                {notification.imageUrl && (
                  <div className={styles.notificationImage}>
                    <img src={notification.imageUrl} alt="알림 이미지" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyContainer}>
            <Icon name="notification-false" size={48} />
            <p>새로운 알림이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  )
} 