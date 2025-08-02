'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import IssueCard from '@/components/IssueCard'
import styles from './home.module.scss'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [newPostId, setNewPostId] = useState(null)
  const router = useRouter()

  // 성공 토스트 확인
  useEffect(() => {
    const shouldShowToast = localStorage.getItem('showSuccessToast')
    const postId = localStorage.getItem('newPostId')
    
    console.log('🔍 토스트 확인:', { shouldShowToast, postId })
    
    if (shouldShowToast === 'true') {
      setShowSuccessToast(true)
      setNewPostId(postId)
      
      console.log('✅ 토스트 표시:', { postId })
      
      localStorage.removeItem('showSuccessToast')
      localStorage.removeItem('newPostId')
      
      // 5초 후 토스트 숨김 (바로가기 버튼 때문에 시간 연장)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 5000)
    }
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 로그인 시 저장된 사용자 ID를 localStorage에서 가져옴
        const userId = localStorage.getItem('userId')
        console.log('🔍 userId from localStorage:', userId) // 디버깅용
        
        if (!userId) {
          console.error('User ID not found')
          return
        }

        // Next.js API Route를 통해 백엔드 데이터 요청
        // 실제 호출: localhost:3000/api/posts → 13.124.229.252:8080/posts
        const apiUrl = `/api/posts?userId=${userId}&sort=latest`
        console.log('🔍 API URL:', apiUrl) // 디버깅용
        
        const response = await fetch(apiUrl)
        
        if (response.ok) {
          // 백엔드에서 받은 기사 목록 데이터
          // 예상 데이터 구조: [{ id, title, content, imageUrl, likeCount, status, createdAt }]
          const data = await response.json()
          console.log('🏠 Home posts data:', data)
          
          // 이미지 URL 디버깅
          if (data && data.length > 0) {
            console.log('🖼️ 이미지 URL 디버깅:', data.map(post => ({
              id: post.id,
              title: post.title,
              imageUrl: post.imageUrl,
              imageUrlType: typeof post.imageUrl
            })))
          }
          
          // 최신순으로 정렬하고 홈에서는 4개만 표시
          const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          const limitedData = sortedData.slice(0, 4)
          
          // 존재하는 게시글 ID들 출력
          console.log('📋 Available post IDs:', limitedData.map(post => post.id))
          
          setPosts(limitedData) // 최신 4개 기사만 state에 저장
        } else {
          console.error('Failed to fetch posts')
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false) // 로딩 상태 종료
      }
    }

    fetchPosts() // 컴포넌트 마운트 시 한 번 실행
  }, [])

  return (
    <div className={styles.homeContainer}>
      {/* 상단 네비게이션 */}
      <header className={styles.header}>
        <div className={styles.logo}>OUTLINE</div>
        <div className={styles.headerIcons}>
          <button className={styles.iconButton} onClick={() => router.push('/search')}>
            <Icon name="search" size={24} />
          </button>
          <button className={styles.iconButton}>
            <div className={styles.notificationIcon}>
              <Icon name="notification-true" size={24} />
              <div className={styles.notificationDot}></div>
            </div>
          </button>
        </div>
      </header>

             {/* 알림 배너 */}
       <div className={styles.alertBanner}>
         <Icon name="siren" size={20} className={styles.alertIcon} />
         <span>전북 고창군 단수</span>
       </div>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 전국 이슈 섹션 */}
        <div className={styles.nationalIssuesSection}>
          <div className={styles.sectionHeader}>
            <h2>전국이슈</h2>
          </div>
        </div>

        {/* 지도 이미지 영역 */}
        <div className={styles.mapSection}>
          <div className={styles.mapContainer} onClick={() => router.push('/map')}>
            <div className={styles.mapPlaceholder}>
              <img src="/icons/map.svg" alt="지도" className={styles.mapImage} />
            </div>
          </div>
        </div>

                {/* 이슈 목록 */}
        <div className={styles.issuesSection}>
          <div className={styles.sectionHeader}>
            <h2>실시간 이슈</h2>
            <button 
              className={styles.moreButton}
              onClick={() => router.push('/issues')}
            >
              더보기
            </button>
          </div>

          {loading ? (
            // API 호출 중일 때 표시
            <div className={styles.loadingContainer}>
              <p>이슈를 불러오는 중...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              {/* 백엔드에서 받은 기사 데이터를 IssueCard 컴포넌트로 렌더링 (최신 4개) */}
              {posts.map((post) => (
                <IssueCard key={post.id} post={post} />
              ))}
              
              {/* 하단 더보기 버튼 */}
              <div className={styles.moreButtonContainer}>
                <button 
                  className={styles.moreButtonFull}
                  onClick={() => router.push('/issues')}
                >
                  더 많은 이슈 보기
                </button>
              </div>
            </>
          ) : (
            // 데이터가 없을 때 표시
            <div className={styles.emptyContainer}>
              <p>아직 제보된 이슈가 없습니다.</p>
            </div>
          )}
        </div>
      </main>

             {/* 하단 네비게이션 */}
       <nav className={styles.bottomNav}>
         <button 
           className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`}
           onClick={() => setActiveTab('home')}
         >
           <Icon name={activeTab === 'home' ? 'home-true' : 'home-false'} size={24} />
           <span>홈</span>
         </button>
         <button 
           className={`${styles.navItem} ${activeTab === 'stats' ? styles.active : ''}`}
           onClick={() => {
             setActiveTab('stats')
             router.push('/stats')
           }}
         >
           <Icon name={activeTab === 'stats' ? 'analysis-true' : 'analysis-false'} size={24} />
           <span>통계</span>
         </button>
                                     <button 
           className={`${styles.navItem} ${activeTab === 'report' ? styles.active : ''}`}
           onClick={() => {
             setActiveTab('report')
             router.push('/report')
           }}
         >
           <Icon name={activeTab === 'report' ? 'upload-true' : 'upload-false'} size={24} />
           <span>제보</span>
         </button>
                   <button 
            className={`${styles.navItem} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Icon name={activeTab === 'favorites' ? 'favorite-true' : 'favorite-false'} size={24} />
            <span>관심 지역</span>
          </button>
         <button 
           className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
           onClick={() => {
             setActiveTab('profile')
             router.push('/profile')
           }}
         >
           <Icon name={activeTab === 'profile' ? 'my-true' : 'my-false'} size={24} />
           <span>내정보</span>
         </button>
       </nav>

       {/* 제보 등록 성공 토스트 */}
       {showSuccessToast && (
         <div className={styles.successToast}>
           <div className={styles.toastContent}>
             <span className={styles.toastText}>제보가 완료되었습니다</span>
             {newPostId && (
               <button 
                 className={styles.toastButton}
                 onClick={() => router.push(`/issues/${newPostId}`)}
               >
                 보러가기 &gt;
               </button>
             )}
           </div>
         </div>
       )}
    </div>
  )
}