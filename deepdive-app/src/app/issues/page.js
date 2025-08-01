'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IssueCard from '@/components/IssueCard'
import Icon from '@/components/icons/Icon'
import styles from './issues.module.scss'

export default function IssuesPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        // 로그인 시 저장된 사용자 ID를 localStorage에서 가져옴
        const userId = localStorage.getItem('userId')
        console.log('🔍 userId from localStorage:', userId) // 디버깅용
        
        if (!userId) {
          console.error('User ID not found')
          return
        }

        // Next.js API Route를 통해 모든 백엔드 데이터 요청
        const apiUrl = `/api/posts?userId=${userId}&sort=latest`
        console.log('🔍 API URL:', apiUrl) // 디버깅용
        
        const response = await fetch(apiUrl)
        
        if (response.ok) {
          // 백엔드에서 받은 전체 기사 목록 데이터
          const data = await response.json()
          console.log('📋 Issues page posts data:', data)
          
          // 최신순으로 정렬 (전체 데이터)
          const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          
          // 존재하는 모든 게시글 ID들 출력
          console.log('📋 All available post IDs:', sortedData.map(post => post.id))
          
          setPosts(sortedData) // 전체 기사 목록을 state에 저장
        } else {
          console.error('Failed to fetch posts')
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false) // 로딩 상태 종료
      }
    }

    fetchAllPosts() // 컴포넌트 마운트 시 한 번 실행
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
        <h1 className={styles.title}>실시간간 이슈</h1>
        <div className={styles.headerSpacer}></div>
      </header>

      {/* 이슈 목록 */}
      <main className={styles.mainContent}>
        {loading ? (
          // API 호출 중일 때 표시
          <div className={styles.loadingContainer}>
            <p>이슈를 불러오는 중...</p>
          </div>
        ) : posts.length > 0 ? (
          // 백엔드에서 받은 전체 기사 데이터를 IssueCard 컴포넌트로 렌더링
          <div className={styles.issuesList}>
            {posts.map((post) => (
              <IssueCard key={post.id} post={post} />
            ))}
          </div>
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