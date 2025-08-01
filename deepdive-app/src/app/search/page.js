'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import IssueCard from '@/components/IssueCard'
import styles from './search.module.scss'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchSort, setSearchSort] = useState('latest') // 'latest' | 'liked'
  const router = useRouter()

  // 검색 기능
  const handleSearch = async (query, sort = 'latest') => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const userId = localStorage.getItem('userId')
      if (!userId) {
        console.error('사용자 ID가 없습니다')
        setSearchResults([])
        return
      }

      const params = new URLSearchParams({
        query: query,
        sort: sort,
        userId: userId
      })
      const apiUrl = `/api/posts/search?${params.toString()}`
      
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } else {
        console.error('검색 실패:', response.status)
        setSearchResults([])
      }
    } catch (error) {
      console.error('검색 오류:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // 검색어 입력 처리
  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      handleSearch(query, searchSort)
    } else {
      setSearchResults([])
    }
  }

  // 검색 정렬 변경
  const handleSortChange = (sort) => {
    setSearchSort(sort)
    if (searchQuery.trim()) {
      handleSearch(searchQuery, sort)
    }
  }

  // 뒤로가기
  const handleBack = () => {
    router.back()
  }

  return (
    <div className={styles.searchContainer}>
      {/* 검색 헤더 */}
      <header className={styles.searchHeader}>
        <button className={styles.backButton} onClick={handleBack}>
          <Icon name="arrow-left" size={24} />
        </button>
        <div className={styles.searchInputContainer}>
          <Icon name="search" size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={handleSearchInput}
            className={styles.searchInput}
            autoFocus
          />
          {searchQuery && (
            <button 
              className={styles.clearButton}
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
              }}
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </header>

      {/* 검색 결과가 있을 때만 정렬 탭 표시 */}
      {searchResults.length > 0 && (
        <div className={styles.searchSortTabs}>
          <button 
            className={`${styles.sortTab} ${searchSort === 'latest' ? styles.active : ''}`}
            onClick={() => handleSortChange('latest')}
          >
            최신순
          </button>
          <button 
            className={`${styles.sortTab} ${searchSort === 'liked' ? styles.active : ''}`}
            onClick={() => handleSortChange('liked')}
          >
            공감순
          </button>
        </div>
      )}
      
      {/* 검색 결과 */}
      <div className={styles.searchResults}>
        {searchLoading ? (
          <div className={styles.searchLoading}>
            <p>검색 중...</p>
          </div>
        ) : searchQuery.trim() ? (
          searchResults.length > 0 ? (
            searchResults.map((post) => (
              <IssueCard key={post.id} post={post} />
            ))
          ) : (
            <div className={styles.noSearchResults}>
              <p>검색 결과가 없습니다.</p>
            </div>
          )
        ) : (
          <div className={styles.searchPlaceholder}>
            <p>검색어를 입력해주세요.</p>
          </div>
        )}
      </div>
    </div>
  )
} 