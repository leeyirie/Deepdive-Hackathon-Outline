import './globals.css'

export const metadata = {
  title: 'OUTLINE - 보이지 않던 지역 이슈를 드러내다',
  description: '지역 이슈를 발견하고 공유하는 플랫폼',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-gray-300 min-h-screen">
        <div className="mx-auto max-w-[440px] min-h-screen bg-white shadow-2xl relative" style={{ boxShadow: '0 0 50px rgba(0, 0, 0, 0.15)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}