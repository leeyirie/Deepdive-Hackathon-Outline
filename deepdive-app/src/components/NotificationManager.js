import { useState, useEffect, useRef } from 'react'
import { NotificationPoller } from '@/lib/services/notifications'
import NotificationToast from './NotificationToast'

export default function NotificationManager({ userId }) {
  const [notifications, setNotifications] = useState([])
  const pollerRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    // 알림 폴링 시작
    pollerRef.current = new NotificationPoller(userId, (newNotification) => {
      console.log('🔔 새로운 알림:', newNotification)
      
      // 새로운 알림을 토스트로 표시
      setNotifications(prev => [...prev, newNotification])
    })

    pollerRef.current.start()

    // 컴포넌트 언마운트 시 폴링 중지
    return () => {
      if (pollerRef.current) {
        pollerRef.current.stop()
      }
    }
  }, [userId])

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  return (
    <>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  )
} 