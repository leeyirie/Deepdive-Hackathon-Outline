'use client'

import { useState, useEffect } from 'react'
import NotificationManager from './NotificationManager'

export default function ClientNotificationManager() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    // 클라이언트에서만 localStorage 접근
    const storedUserId = localStorage.getItem('userId')
    setUserId(storedUserId)
  }, [])

  if (!userId) return null

  return <NotificationManager userId={userId} />
} 