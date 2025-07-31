'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import styles from './home.module.scss'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home')
  const router = useRouter()

  return (
    <div className={styles.homeContainer}>
      {/* 상단 네비게이션 */}
      <header className={styles.header}>
        <div className={styles.logo}>OUTLINE</div>
        <div className={styles.headerIcons}>
                     <button className={styles.iconButton}>
             <Icon name="search" size={24} />
           </button>
           <button className={styles.iconButton}>
             <div className={styles.notificationIcon}>
               <Icon name="notification-true" size={24} />
               <div className={styles.notificationDot}></div>
             </div>
           </button>
        </div>
      </header>

             {/* 알림 배너 */}
       <div className={styles.alertBanner}>
         <Icon name="siren" size={16} />
         <span>전북 고창군 단수</span>
       </div>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 지도 영역 */}
        <div className={styles.mapSection}>
          <div className={styles.mapContainer}>
            <div className={styles.mapPlaceholder}>
              <span>카카오맵 API</span>
            </div>
          </div>
        </div>

        {/* 이슈 목록 */}
        <div className={styles.issuesSection}>
          <div className={styles.sectionHeader}>
            <h2>제보된 이슈</h2>
            <button className={styles.moreButton}>더보기</button>
          </div>

          {/* 첫 번째 이슈 */}
          <div className={styles.issueCard}>
            <div className={styles.issueContent}>
              <div className={styles.statusTagTop}>
                                 <span className={`${styles.statusTag} ${styles.inProgress}`}>
                   <Icon name="ongoing" size={14} />
                   진행중
                 </span>
              </div>
                             <div className={styles.issueMain}>
                 <div className={styles.issueText}>
                   <h3>전북 고창군 산불</h3>
                   <p className={styles.issueDescription}>
                     전북 고창군 단수 전북 고창군 단수 전북 고창군 단수 전북 고창군 단수 전북 고창군 단수 전북 고창군 단수 전북 고창군 단수 전북 고창군 단수
                   </p>
                   <div className={styles.issueMeta}>
                     <span>12시간 전</span>
                     <span>공감수 124</span>
                   </div>
                 </div>
                 <div className={styles.issueImage}>
                   <div className={styles.imagePlaceholder}>🔥</div>
                 </div>
               </div>
            </div>
          </div>

          {/* 두 번째 이슈 */}
          <div className={styles.issueCard}>
            <div className={styles.issueContent}>
              <div className={styles.statusTagTop}>
                                 <span className={`${styles.statusTag} ${styles.resolved}`}>
                   <Icon name="resolve" size={14} />
                   해결됨
                 </span>
              </div>
              <div className={styles.issueMain}>
                <div className={styles.issueText}>
                  <h3>전북 고창군 단수</h3>
                  <p className={styles.issueDescription}>
                    전북 고창군 단수 문제가 해결되었습니다. 지역 주민들의 협조로 정상적인 물 공급이 재개되었습니다.
                  </p>
                  <div className={styles.issueMeta}>
                    <span>1일 전</span>
                    <span>공감수 89</span>
                  </div>
                </div>
                <div className={styles.issueImage}>
                  <div className={styles.imagePlaceholder}>💧</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

             {/* 하단 네비게이션 */}
       <nav className={styles.bottomNav}>
         <button 
           className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`}
           onClick={() => setActiveTab('home')}
         >
           <Icon name={activeTab === 'home' ? 'home-true' : 'home-false'} size={20} />
           <span>홈</span>
         </button>
         <button 
           className={`${styles.navItem} ${activeTab === 'stats' ? styles.active : ''}`}
           onClick={() => {
             setActiveTab('stats')
             router.push('/stats')
           }}
         >
           <Icon name={activeTab === 'stats' ? 'analysis-true' : 'analysis-false'} size={20} />
           <span>통계</span>
         </button>
                   <button 
            className={`${styles.navItem} ${activeTab === 'report' ? styles.active : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <Icon name="upload-false" size={20} />
            <span>제보</span>
          </button>
                   <button 
            className={`${styles.navItem} ${activeTab === 'favorites' ? styles.active : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Icon name={activeTab === 'favorites' ? 'favorite-true' : 'favorite-false'} size={20} />
            <span>관심 지역</span>
          </button>
         <button 
           className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
           onClick={() => setActiveTab('profile')}
         >
           <Icon name={activeTab === 'profile' ? 'my-true' : 'my-false'} size={20} />
           <span>내정보</span>
         </button>
       </nav>
    </div>
  )
}