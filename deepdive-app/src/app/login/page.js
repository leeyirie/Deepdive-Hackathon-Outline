'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './login.module.scss'

export default function LoginPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (nickname.trim()) {
      // 로그인 처리 로직
      console.log('닉네임:', nickname)
      // 여기서 실제로는 로그인 정보를 저장하거나 처리하는 로직이 들어갈 수 있습니다
      localStorage.setItem('userNickname', nickname.trim())
      // 홈 페이지로 이동
      router.push('/home')
    }
  }

  const isButtonActive = nickname.trim().length > 0

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
            간단하게 시작하기
          </button>
        </form>
      </div>
    </div>
  )
} 
