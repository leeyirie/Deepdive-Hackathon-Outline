'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IssueCard from '@/components/IssueCard'
import Icon from '@/components/icons/Icon'
import styles from './issues.module.scss'

export default function IssuesPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('latest') // 'latest' | 'likes'
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const router = useRouter()

  // 포스트 데이터 가져오기 함수
  const fetchPosts = async (tabType = activeTab, pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)
      
      const userId = localStorage.getItem('userId')
      console.log('🔍 userId from localStorage:', userId)
      
      if (!userId) {
        console.error('User ID not found')
        return
      }

      // 정렬 기준에 따른 API 호출
      const sortParam = tabType === 'likes' ? 'likes' : 'latest'
      const apiUrl = `/api/posts?userId=${userId}&sort=${sortParam}&page=${pageNum}&limit=10`
      console.log('🔍 API URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Issues page posts data:', data)
        
        // 데이터 정렬
        const sortedData = (data || []).sort((a, b) => {
          if (tabType === 'likes') {
            return (b.likeCount || 0) - (a.likeCount || 0)
          }
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        
        console.log('📋 Available post IDs:', sortedData.map(post => post.id))
        
        if (append) {
          setPosts(prev => [...prev, ...sortedData])
        } else {
          setPosts(sortedData)
        }
        
        // 더 가져올 데이터가 있는지 확인 (10개 미만이면 더 이상 없음)
        setHasMore(sortedData.length >= 10)
        
      } else {
        console.error('Failed to fetch posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 탭 변경 함수
  const handleTabChange = (tabType) => {
    if (tabType === activeTab) return
    
    setActiveTab(tabType)
    setPage(1)
    setHasMore(true)
    fetchPosts(tabType, 1, false)
  }

  // 더보기 함수
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return
    
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(activeTab, nextPage, true)
  }

  useEffect(() => {
    fetchPosts('latest', 1, false)
  }, [])

  return (
    <div className={styles.issuesContainer}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => router.back()}
        >
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={styles.title}>실시간 이슈</h1>
        <div className={styles.headerSpacer}></div>
      </header>

      {/* 탭 메뉴 */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'latest' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('latest')}
        >
          최신순
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'likes' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('likes')}
        >
          공감순
        </button>
      </div>

      {/* 이슈 목록 */}
      <main className={styles.mainContent}>
        {loading ? (
          // API 호출 중일 때 표시
          <div className={styles.loadingContainer}>
            <p>이슈를 불러오는 중...</p>
          </div>
        ) : posts.length > 0 ? (
          // 백엔드에서 받은 전체 기사 데이터를 IssueCard 컴포넌트로 렌더링
          <>
            <div className={styles.issuesList}>
              {posts.map((post) => (
                <IssueCard key={post.id} post={post} />
              ))}
            </div>
            
            {/* 더보기 버튼 */}
            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button 
                  className={styles.loadMoreButton}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      <span>불러오는 중...</span>
                    </>
                  ) : (
                    '더보기'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          // 데이터가 없을 때 표시
          <div className={styles.emptyContainer}>
            <p>아직 제보된 이슈가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  )
}