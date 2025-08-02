'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import styles from './profile.module.scss'

export default function ProfilePage() {
  const [userName, setUserName] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 사용자 정보 가져오기 (localStorage 먼저 확인, 없으면 API 호출)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = localStorage.getItem('userId')
        const savedUserName = localStorage.getItem('userName')
        
        console.log('🔍 userId from localStorage:', userId)
        console.log('🔍 savedUserName from localStorage:', savedUserName)
        
        if (!userId) {
          console.error('User ID not found in localStorage')
          router.push('/login')
          return
        }

        // localStorage에 사용자 이름이 있으면 먼저 사용
        if (savedUserName) {
          console.log('✅ Using saved username from localStorage:', savedUserName)
          setUserName(savedUserName)
          setLoading(false)
          return
        }

        // localStorage에 없으면 API 호출
        console.log('🔄 Fetching user data from API...')
        const apiUrl = `/api/auth/me/${userId}`
        console.log('🔍 API URL:', apiUrl)
        
        const response = await fetch(apiUrl)
        
        if (response.ok) {
          const userData = await response.json()
          console.log('👤 User data received:', userData)
          
          if (userData.username) {
            setUserName(userData.username)
            // localStorage에 저장
            localStorage.setItem('userName', userData.username)
          } else {
            console.error('Username not found in response')
            router.push('/login')
          }
        } else {
          console.error('Failed to fetch user data')
          router.push('/login')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [router])

  // 알림 설정 토글
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled)
  }

  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    router.push('/login')
  }

  // 탈퇴 처리
  const handleWithdraw = () => {
    if (confirm('정말로 탈퇴하시겠습니까?')) {
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      router.push('/login')
    }
  }

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <header className={styles.header}>
          <h1 className={styles.title}>내 정보</h1>
        </header>
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <p>사용자 정보를 불러오는 중...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.profileContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>내 정보</h1>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 사용자 프로필 섹션 */}
        <div className={styles.profileSection}>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                <Icon name="my-true" size={48} />
              </div>
              <div className={styles.userDetails}>
                <h2 className={styles.userName}>{userName}</h2>
              </div>
            </div>
            <div className={styles.userActions}>
              <button className={styles.actionButton}>
                <Icon name="upload-true" size={20} />
                <span>내 제보</span>
              </button>
              <button className={styles.actionButton}>
                <Icon name="favorite-true" size={20} />
                <span>공감한 이슈</span>
              </button>
            </div>
          </div>
        </div>

        {/* 사용자 설정 섹션 */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsCard}>
            <h3 className={styles.sectionTitle}>사용자 설정</h3>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <Icon name="notification-false" size={20} />
                <span>알림 수신 설정</span>
              </div>
              <button 
                className={`${styles.toggle} ${notificationsEnabled ? styles.active : ''}`}
                onClick={toggleNotifications}
              >
                <div className={styles.toggleHandle}></div>
              </button>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <Icon name="theme" size={20} />
                <span>테마 설정</span>
              </div>
              <div className={styles.settingValue}>
                <span>자동</span>
                <Icon name="chevron-down" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* 기타 설정 섹션 */}
        <div className={styles.otherSettingsSection}>
          <div className={styles.settingsCard}>
            <h3 className={styles.sectionTitle}>기타 설정</h3>
            <div className={styles.settingItem}>
              <span>공지사항</span>
              <Icon name="chevron-down" size={16} />
            </div>
            <div className={styles.settingItem}>
              <span>고객센터</span>
              <Icon name="chevron-down" size={16} />
            </div>
            <div className={styles.settingItem}>
              <span>API 관련 고지</span>
              <Icon name="chevron-down" size={16} />
            </div>
            <div className={styles.settingItem}>
              <span>버전 정보</span>
              <div className={styles.settingValue}>
                <span>v1.0</span>
                <Icon name="chevron-down" size={16} />
              </div>
            </div>
            
            {/* 구분선 */}
            <div className={styles.divider}></div>
            
            {/* 액션 버튼 */}
            <div className={styles.actionButtons}>
              <button className={styles.logoutButton} onClick={handleLogout}>
                로그아웃
              </button>
              <button className={styles.withdrawButton} onClick={handleWithdraw}>
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('home')
            router.push('/home')
          }}
        >
          <Icon name="home-false" size={24} />
          <span>홈</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('stats')
            router.push('/stats')
          }}
        >
          <Icon name="analysis-false" size={24} />
          <span>통계</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'report' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('report')
            router.push('/report')
          }}
        >
          <Icon name="upload-false" size={24} />
          <span>제보</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'community' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('community')
            router.push('/community')
          }}
        >
          <Icon name={activeTab === 'community' ? 'location' : 'location'} size={24} />
          <span>커뮤니티</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Icon name="my-true" size={24} />
          <span>내정보</span>
        </button>
      </nav>
    </div>
  )
} 