'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleScreenTouch = () => {
    router.push('/login')
  }

  return (
    <div
      className="cursor-pointer"
      onClick={handleScreenTouch}
      onTouchStart={handleScreenTouch} // 모바일 터치 이벤트 추가
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#262E39',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation', // 터치 최적화
        WebkitTapHighlightColor: 'transparent' // 터치 하이라이트 제거
      }}
    >
      <h1 
        className="select-none"
        style={{ 
          color: 'white',
          fontSize: '2.25rem',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: 0
        }}
      >
        OUTLINE
      </h1>
    </div>
  )
}