import { useState, useEffect } from 'react'
import Icon from '@/components/icons/Icon'
import styles from './NotificationToast.module.scss'

export default function NotificationToast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // 5초 후 자동으로 사라지기
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // 애니메이션 완료 후 제거
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])



  const formatTime = (createdAt) => {
    try {
      const date = new Date(createdAt)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      
      if (diffMins < 1) return '방금 전'
      if (diffMins < 60) return `${diffMins}분 전`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}시간 전`
      
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}일 전`
    } catch (error) {
      return '방금 전'
    }
  }

  return (
    <div className={`${styles.notificationToast} ${isVisible ? styles.visible : styles.hidden}`}>
      <div className={styles.toastContent}>
        <div className={styles.toastIcon}>
          <Icon name="notification-true" size={20} />
        </div>
        <div className={styles.toastText}>
          <p className={styles.toastMessage}>{notification.message}</p>
          <span className={styles.toastTime}>{formatTime(notification.createdAt)}</span>
        </div>
      </div>
    </div>
  )
} 