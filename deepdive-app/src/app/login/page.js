'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [nickname, setNickname] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (nickname.trim()) {
      // 로그인 처리 로직
      console.log('닉네임:', nickname)
      // 여기에 실제 로그인 로직 추가
    }
  }

  const isButtonActive = nickname.trim().length > 0

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* OUTLINE + 설명 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 320, width: 286 }} // 440-77*2=286
      >
        <h1 className="text-2xl font-bold text-black text-center mb-2">OUTLINE</h1>
        <p className="text-sm text-gray-600 text-center">보이지 않던 지역 이슈를 드러내다</p>
      </div>

      {/* 입력/버튼 */}
      <form
        onSubmit={handleSubmit}
        className="absolute left-0 bottom-0 w-full bg-white"
        style={{ padding: '12px 16px' }}
      >
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="닉네임을 입력해주세요."
          className={`w-full mb-2 px-4 py-3 rounded-lg border transition-all duration-200 ${
            isFocused || nickname
              ? 'bg-white border-black'
              : 'bg-gray-100 border-gray-100'
          } ${
            nickname ? 'text-black' : 'text-gray-500'
          } placeholder-gray-500 focus:outline-none`}
        />
        <button
          type="submit"
          disabled={!isButtonActive}
          className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
            isButtonActive
              ? 'bg-charcoal text-white hover:bg-gray-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          간단하게 시작하기
        </button>
      </form>
    </div>
  )
} 