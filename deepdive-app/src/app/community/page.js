'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import InterestRegionModal from '@/components/InterestRegionModal'
import styles from './community.module.scss'

export default function CommunityPage() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState('문경시')
  const [showInterestRegionModal, setShowInterestRegionModal] = useState(false)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('community')
  const [interestRegions, setInterestRegions] = useState([])

  // Dummy data for posts and emergency alerts
  const dummyPosts = {
    '문경시': [
      {
        id: 1,
        author: '유진',
        content: '요즘 문경에 진짜 비 많이 오네요... 다들 출근길 괜찮으셨어요?',
        timestamp: '방금'
      },
      {
        id: 2,
        author: '요한이',
        content: '문경 쪽은 벌써 매미 울기 시작했어요 ㅋㅋ 여름 왔네요',
        timestamp: '5분 전'
      }
    ],
    '창원시': [
      {
        id: 3,
        author: '지영',
        content: '창원 날씨가 좋네요. 산책하기 딱 좋은 날씨예요!',
        timestamp: '10분 전'
      }
    ]
  }

  const emergencyMessage = {
    '문경시': {
      content: '문경시 일부 지역 정전 발생, 외출 시 유의 바람',
      timestamp: '1분 전'
    },
    '창원시': null
  }

  useEffect(() => {
    // Simulate loading posts
    setLoading(true)
    setTimeout(() => {
      setPosts(dummyPosts[selectedRegion] || [])
      setLoading(false)
    }, 500)
  }, [selectedRegion])

  const handleRegionChange = (region) => {
    setSelectedRegion(region)
  }

  const handleInterestRegionModal = () => {
    setShowInterestRegionModal(true)
  }

  const handleAddInterestRegion = (regionName) => {
    if (interestRegions.length < 10) {
      setInterestRegions(prev => [...prev, regionName])
      console.log('✅ 관심지역 추가:', regionName)
    }
  }

  return (
    <div className={styles.communityContainer}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={styles.title}>커뮤니티</h1>
      </header>

      {/* Region Tabs */}
      <div className={styles.regionTabs}>
        <button 
          className={`${styles.regionTab} ${selectedRegion === '문경시' ? styles.active : ''}`} 
          onClick={() => handleRegionChange('문경시')}
        >
          문경시
        </button>
        <button 
          className={`${styles.regionTab} ${selectedRegion === '창원시' ? styles.active : ''}`} 
          onClick={() => handleRegionChange('창원시')}
        >
          창원시
        </button>
        <button className={styles.addRegionTab} onClick={handleInterestRegionModal}>
          + 관심지역 추가
        </button>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Emergency Message */}
        {emergencyMessage[selectedRegion] && (
          <div className={styles.emergencyMessage}>
            <div className={styles.emergencyIcon}>
              <Icon name="siren" size={20} />
            </div>
            <div className={styles.emergencyContent}>
              <p className={styles.emergencyText}>{emergencyMessage[selectedRegion].content}</p>
              <div className={styles.emergencyMeta}>
                <span className={styles.emergencyAuthor}>관리자</span>
                <span className={styles.emergencyTimestamp}>{emergencyMessage[selectedRegion].timestamp}</span>
              </div>
            </div>
            <div className={styles.emergencyIndicators}>
              <span className={`${styles.indicator} ${styles.active}`}></span>
              <span className={styles.indicator}></span>
            </div>
          </div>
        )}

        {/* Community Posts */}
        <div className={styles.postsContainer}>
          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : (
            <div className={styles.postsList}>
              {posts.map(post => (
                <div key={post.id} className={styles.postItem}>
                  <div className={styles.postHeader}>
                    <div className={styles.postAuthor}>
                      <div className={styles.authorAvatar}></div>
                      <div className={styles.authorInfo}>
                        <span className={styles.authorName}>{post.author}</span>
                        <span className={styles.timestamp}>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.postContent}>
                    <p>{post.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Interest Region Modal */}
      <InterestRegionModal
        isOpen={showInterestRegionModal}
        onClose={() => setShowInterestRegionModal(false)}
        onAddRegion={handleAddInterestRegion}
      />

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`} 
          onClick={() => { setActiveTab('home'); router.push('/home') }}
        >
          <Icon name={activeTab === 'home' ? 'home-true' : 'home-false'} size={24} />
          <span>홈</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'stats' ? styles.active : ''}`} 
          onClick={() => { setActiveTab('stats'); router.push('/stats') }}
        >
          <Icon name={activeTab === 'stats' ? 'analysis-true' : 'analysis-false'} size={24} />
          <span>통계</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'report' ? styles.active : ''}`} 
          onClick={() => { setActiveTab('report'); router.push('/report') }}
        >
          <Icon name={activeTab === 'report' ? 'upload-true' : 'upload-false'} size={24} />
          <span>제보</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'community' ? styles.active : ''}`} 
          onClick={() => setActiveTab('community')}
        >
          <Icon name={activeTab === 'community' ? 'location' : 'location'} size={24} />
          <span>커뮤니티</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`} 
          onClick={() => { setActiveTab('profile'); router.push('/profile') }}
        >
          <Icon name={activeTab === 'profile' ? 'my-true' : 'my-false'} size={24} />
          <span>내정보</span>
        </button>
      </nav>
    </div>
  )
} 