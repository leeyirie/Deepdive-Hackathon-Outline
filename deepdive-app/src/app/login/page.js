'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './login.module.scss'

export default function LoginPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (nickname.trim() && !isLoading) {
      setIsLoading(true)
      try {
        // Next.js API Route를 통해 백엔드 호출
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: nickname.trim()
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('로그인 성공:', data)
          
          // 로그인 정보 저장
          localStorage.setItem('userId', data.userId)
          localStorage.setItem('userNickname', data.username || nickname.trim())
          
          // 홈 페이지로 이동
          router.push('/home')
        } else {
          console.error('로그인 실패:', response.status)
          alert('로그인에 실패했습니다. 다시 시도해주세요.')
        }
      } catch (error) {
        console.error('로그인 에러:', error)
        alert('서버 연결에 실패했습니다. 다시 시도해주세요.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const isButtonActive = nickname.trim().length > 0 && !isLoading

  return (
    <div className={styles.loginContainer}>
      {/* OUTLINE + 설명 - 화면 중앙 */}
      <div className={styles.outlineSection}>
        <h1 className={styles.outlineTitle}>OUTLINE</h1>
        <p className={styles.outlineDescription}>보이지 않던 지역 이슈를 드러내다</p>
      </div>

      {/* 입력/버튼 - 하단 고정 */}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="닉네임을 입력해주세요."
            className={styles.input}
          />
          
          <button
            type="submit"
            disabled={!isButtonActive}
            className={`${styles.button} ${isButtonActive ? styles.active : styles.inactive}`}
          >
            {isLoading ? '로그인 중...' : '간단하게 시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
} 
