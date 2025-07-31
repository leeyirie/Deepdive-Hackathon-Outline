import './globals.css'
import { headers } from 'next/headers'

export const metadata = {
  title: 'OUTLINE - 보이지 않던 지역 이슈를 드러내다',
  description: '지역 이슈를 발견하고 공유하는 플랫폼',
}

export default function RootLayout({ children }) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || '/'
  const isMain = pathname === '/'

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-gray-200 min-h-screen flex items-center justify-center">
        <div className={`w-full max-w-[440px] min-w-0 h-screen ${isMain ? '' : 'bg-white shadow-2xl rounded-lg'}`}>
          {children}
        </div>
      </body>
    </html>
  )
}