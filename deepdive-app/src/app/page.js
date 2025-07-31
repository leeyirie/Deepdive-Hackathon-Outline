'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push('/login')
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center cursor-pointer bg-gray-600"
      onClick={handleLogoClick}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#262E39'
      }}
    >
      <h1 
        className="text-white text-4xl font-bold select-none"
        style={{ color: 'white' }}
      >
        OUTLINE
      </h1>
    </div>
  )
}