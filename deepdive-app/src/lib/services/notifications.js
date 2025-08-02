// 알림 관련 API 서비스

// 알림 목록 가져오기
export const fetchNotifications = async (userId) => {
  try {
    const response = await fetch(`/api/notifications/${userId}`)
    if (!response.ok) {
      throw new Error('알림을 가져오는데 실패했습니다.')
    }
    return await response.json()
  } catch (error) {
    console.error('알림 가져오기 오류:', error)
    throw error
  }
}

// Long Polling을 위한 알림 감지
export class NotificationPoller {
  constructor(userId, onNewNotification) {
    this.userId = userId
    this.onNewNotification = onNewNotification
    this.lastNotificationId = null
    this.isPolling = false
    this.pollInterval = 10000 // 10초마다 체크
  }

  start() {
    if (this.isPolling) return
    
    this.isPolling = true
    this.poll()
  }

  stop() {
    this.isPolling = false
  }

  async poll() {
    if (!this.isPolling) return

    try {
      const notifications = await fetchNotifications(this.userId)
      
      if (notifications && notifications.length > 0) {
        const latestNotification = notifications[0] // 가장 최신 알림
        
        // 초기 로딩 시에는 최신 알림 ID만 설정하고 알림 표시하지 않음
        if (!this.lastNotificationId) {
          this.lastNotificationId = latestNotification.id
          console.log('🔔 초기 알림 ID 설정:', this.lastNotificationId)
          return
        }
        
        // 새로운 알림이 있는지 확인
        if (latestNotification.id > this.lastNotificationId) {
          // 새로운 알림들을 찾기
          const newNotifications = notifications.filter(
            notification => notification.id > this.lastNotificationId
          )
          
          console.log('🔔 새로운 알림 발견:', newNotifications.length, '개')
          
          // 새로운 알림들을 역순으로 표시 (가장 오래된 것부터)
          newNotifications.reverse().forEach(notification => {
            this.onNewNotification(notification)
          })
          
          // 최신 알림 ID 업데이트
          this.lastNotificationId = latestNotification.id
        }
      }
    } catch (error) {
      console.error('알림 폴링 오류:', error)
    }

    // 다음 폴링 예약
    if (this.isPolling) {
      setTimeout(() => this.poll(), this.pollInterval)
    }
  }
} 