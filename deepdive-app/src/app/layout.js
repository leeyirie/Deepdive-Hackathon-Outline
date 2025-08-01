import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'OUTLINE - 보이지 않던 지역 이슈를 드러내다',
  description: '지역 이슈를 발견하고 공유하는 플랫폼',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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
        {/* 네이버 지도 API 전역 미리 로드 */}
        <Script
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '48054bm8uv'}`}
          strategy="afterInteractive"
        />
        
        {/* 전역 스크립트로 로딩 상태 관리 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 네이버 지도 API 로딩 완료 체크
              function checkNaverMapLoaded() {
                if (window.naver && window.naver.maps) {
                  console.log('🌐 전역에서 네이버 지도 API 미리 로드 완료!');
                  window.naverMapPreloaded = true;
                  clearInterval(window.naverMapCheckInterval);
                }
              }
              
              // 주기적으로 체크 (최대 10초)
              window.naverMapCheckInterval = setInterval(checkNaverMapLoaded, 100);
              setTimeout(() => {
                if (window.naverMapCheckInterval) {
                  clearInterval(window.naverMapCheckInterval);
                  if (!window.naverMapPreloaded) {
                    console.log('❌ 전역 지도 API 미리 로드 실패 - 타임아웃');
                    console.error('🔍 API 키:', '${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '48054bm8uv'}');
                  }
                }
              }, 10000);
            `,
          }}
        />
        
        <div className="w-full min-h-screen bg-white relative sm:mx-auto sm:max-w-[440px]" style={{ boxShadow: '0 0 50px rgba(0, 0, 0, 0.15)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}