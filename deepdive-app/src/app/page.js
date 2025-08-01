'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push('/login')
  }

  return (
    <div
      className="cursor-pointer"
      onClick={handleLogoClick}
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#262E39',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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