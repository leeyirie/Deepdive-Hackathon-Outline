'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import styles from './community.module.scss'

export default function CommunityPage() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState('문경시')
  const [selectedContentTab, setSelectedContentTab] = useState('커뮤니티')
  const [showInterestRegionModal, setShowInterestRegionModal] = useState(false)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [activeTab, setActiveTab] = useState('community')

  // Dummy data for posts and emergency alerts
  const dummyPosts = {
    '문경시': [
      {
        id: 1,
        author: '유진',
        content: '요즘 문경에 진짜 비 많이 오네요... 다들 출근길 괜찮으셨어요?',
        timestamp: '방금',
        comments: 3
      },
      {
        id: 2,
        author: '요한이',
        content: '문경 쪽은 벌써 매미 울기 시작했어요 ㅋㅋ 여름 왔네요',
        timestamp: '5분 전',
        comments: 6
      }
    ],
    '창원시': [
      {
        id: 3,
        author: '지영',
        content: '창원 날씨가 좋네요. 산책하기 딱 좋은 날씨예요!',
        timestamp: '10분 전',
        comments: 2
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

  const handleContentTabChange = (tab) => {
    setSelectedContentTab(tab)
  }

  const handleInterestRegionModal = () => {
    setShowInterestRegionModal(!showInterestRegionModal)
  }

  const handleWritePost = () => {
    setShowPostModal(true)
  }

  const handleSubmitPost = () => {
    if (postContent.trim()) {
      const newPost = {
        id: Date.now(),
        author: '나',
        content: postContent,
        timestamp: '방금',
        comments: 0
      }
      setPosts([newPost, ...posts])
      setPostContent('')
      setShowPostModal(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  const handleRegionSelect = (region) => {
    setSelectedRegion(region)
    setShowInterestRegionModal(false)
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

      {/* Content Tabs */}
      <div className={styles.contentTabs}>
        <button 
          className={`${styles.contentTab} ${selectedContentTab === '이슈' ? styles.active : ''}`} 
          onClick={() => handleContentTabChange('이슈')}
        >
          이슈
        </button>
        <button 
          className={`${styles.contentTab} ${selectedContentTab === '커뮤니티' ? styles.active : ''}`} 
          onClick={() => handleContentTabChange('커뮤니티')}
        >
          커뮤니티
        </button>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {selectedContentTab === '커뮤니티' && (
          <>
            {/* Emergency Message */}
            {emergencyMessage[selectedRegion] && (
              <div className={styles.emergencyMessage}>
                <div className={styles.emergencyIcon}>
                  <Icon name="warning" size={20} />
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
                      <div className={styles.postActions}>
                        <button className={styles.commentButton}>
                          <Icon name="comment" size={16} />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {selectedContentTab === '이슈' && (
          <div className={styles.issuesContainer}>
            <div className={styles.loading}>이슈 기능은 준비 중입니다.</div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button className={styles.writeButton} onClick={handleWritePost}>
        <Icon name="edit" size={24} />
      </button>

      {/* Post Write Modal */}
      {showPostModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPostModal(false)}>
          <div className={styles.postModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>게시글 작성</h3>
              <button onClick={() => setShowPostModal(false)}>
                <Icon name="close" size={24} />
              </button>
            </div>
            <textarea
              className={styles.postTextarea}
              placeholder="내용을 입력하세요..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            <div className={styles.modalActions}>
              <button 
                className={styles.submitButton}
                onClick={handleSubmitPost}
                disabled={!postContent.trim()}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interest Region Modal */}
      {showInterestRegionModal && (
        <div className={styles.modalOverlay} onClick={handleInterestRegionModal}>
          <div className={styles.interestModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>관심지역 추가</h3>
              <button onClick={handleInterestRegionModal}>
                <Icon name="close" size={24} />
              </button>
            </div>
            <div className={styles.regionList}>
              <button onClick={() => handleRegionSelect('서울특별시')}>서울특별시</button>
              <button onClick={() => handleRegionSelect('부산광역시')}>부산광역시</button>
              <button onClick={() => handleRegionSelect('대구광역시')}>대구광역시</button>
              <button onClick={() => handleRegionSelect('인천광역시')}>인천광역시</button>
              <button onClick={() => handleRegionSelect('광주광역시')}>광주광역시</button>
              <button onClick={() => handleRegionSelect('대전광역시')}>대전광역시</button>
              <button onClick={() => handleRegionSelect('울산광역시')}>울산광역시</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className={styles.successToast}>게시글이 등록되었습니다!</div>
      )}

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