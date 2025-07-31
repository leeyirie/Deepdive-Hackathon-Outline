'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push('/login')
  }

  return (
    <div
      className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-600"
      onClick={handleLogoClick}
    >
      <h1 className="text-white text-4xl font-bold select-none">OUTLINE</h1>
    </div>
  )
}