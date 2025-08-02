'use client'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'

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
        height: '100dvh', // dynamic viewport height
        backgroundColor: '#262E39',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'manipulation', // 터치 최적화
        WebkitTapHighlightColor: 'transparent', // 터치 하이라이트 제거
        WebkitOverflowScrolling: 'touch' // iOS 스크롤 최적화
      }}
    >

               {/* 화이트 로고 아이콘 */}
        <div style={{ marginBottom: '1rem' }}>
           <Icon name="logo" size={80} color="white" />
         </div>
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