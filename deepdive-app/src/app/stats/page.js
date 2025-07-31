'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import styles from './stats.module.scss'

export default function StatsPage() {
  const [selectedYear, setSelectedYear] = useState('2025년')
  const [selectedMonth, setSelectedMonth] = useState('4월')
  const [activeTab, setActiveTab] = useState('stats')
  const router = useRouter()

  return (
    <div className={styles.statsContainer}>
      {/* 상단 네비게이션 */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push('/home')}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={styles.title}>통계</h1>
        <div className={styles.spacer}></div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.mainContent}>
        {/* 년도/월 선택 */}
        <div className={styles.dateSelector}>
          <div className={styles.dropdown}>
            <span>{selectedYear}</span>
            <Icon name="chevron-down" size={16} />
          </div>
          <div className={styles.dropdown}>
            <span>{selectedMonth}</span>
            <Icon name="chevron-down" size={16} />
          </div>
        </div>

        {/* 통계 카드들 */}
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>총 공감 수</div>
            <div className={styles.statValue}>9,661</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>기관 접수 사례</div>
            <div className={styles.statValue}>
              <span className={styles.mainNumber}>18</span>
              <span className={styles.unit}>회/주</span>
            </div>
          </div>
        </div>

        {/* 이슈 발생 추세 */}
        <div className={styles.chartSection}>
          <h3 className={styles.sectionTitle}>이슈 발생 추세</h3>
          <div className={styles.lineChart}>
            <div className={styles.chartArea}>
              <svg viewBox="0 0 300 120" className={styles.lineChartSvg}>
                <path
                  d="M20,80 L80,40 L140,60 L200,90 L260,50"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="80" r="3" fill="#2563eb" stroke="white" strokeWidth="1.5" />
                <circle cx="80" cy="40" r="3" fill="#2563eb" stroke="white" strokeWidth="1.5" />
                <circle cx="140" cy="60" r="3" fill="#2563eb" stroke="white" strokeWidth="1.5" />
                <circle cx="200" cy="90" r="3" fill="#2563eb" stroke="white" strokeWidth="1.5" />
                <circle cx="260" cy="50" r="3" fill="#2563eb" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <div className={styles.chartLabels}>
              <span>1주</span>
              <span>2주</span>
              <span>3주</span>
              <span>4주</span>
              <span>5주</span>
            </div>
          </div>
        </div>

        {/* 지역별 공감 비율 */}
        <div className={styles.chartSection}>
          <h3 className={styles.sectionTitle}>지역별 공감 비율</h3>
          <div className={styles.pieChartContainer}>
            <div className={styles.pieChart}>
              <svg viewBox="0 0 160 160" className={styles.donutChart}>
                {/* 경상도 49.5% */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#10b981" strokeWidth="20" 
                        strokeDasharray="186 190" strokeDashoffset="0" transform="rotate(-90 80 80)" />
                {/* 강원도 19.7% */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#3b82f6" strokeWidth="20" 
                        strokeDasharray="74 302" strokeDashoffset="-186" transform="rotate(-90 80 80)" />
                {/* 전라도 13.7% */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#6366f1" strokeWidth="20" 
                        strokeDasharray="52 324" strokeDashoffset="-260" transform="rotate(-90 80 80)" />
                {/* 충청도 11.2% */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#ec4899" strokeWidth="20" 
                        strokeDasharray="42 334" strokeDashoffset="-312" transform="rotate(-90 80 80)" />
                {/* 제주도 5.9% */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#d1d5db" strokeWidth="20" 
                        strokeDasharray="22 354" strokeDashoffset="-354" transform="rotate(-90 80 80)" />
              </svg>
            </div>
            <div className={styles.legendList}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.gyeongsang}`}></div>
                <span className={styles.legendLabel}>경상도 (49.5%)</span>
                <span className={styles.legendValue}>4,783 공감</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.gangwon}`}></div>
                <span className={styles.legendLabel}>강원도 (19.7%)</span>
                <span className={styles.legendValue}>1,902 공감</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.jeonra}`}></div>
                <span className={styles.legendLabel}>전라도 (13.7%)</span>
                <span className={styles.legendValue}>1,320 공감</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.chungcheong}`}></div>
                <span className={styles.legendLabel}>충청도 (11.2%)</span>
                <span className={styles.legendValue}>1,087 공감</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.jeju}`}></div>
                <span className={styles.legendLabel}>제주도 (5.9%)</span>
                <span className={styles.legendValue}>569 공감</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상위 이슈 */}
        <div className={styles.topIssuesSection}>
          <h3 className={styles.sectionTitle}>상위 이슈</h3>
          <div className={styles.issuesList}>
            <div className={styles.issueItem}>
              <span className={styles.issueRank}>1</span>
              <span className={styles.issueTitle}>경남 산청군 홍수</span>
              <span className={styles.issueCount}>432 공감</span>
            </div>
            <div className={styles.issueItem}>
              <span className={styles.issueRank}>2</span>
              <span className={styles.issueTitle}>경북 의성군 산불</span>
              <span className={styles.issueCount}>359 공감</span>
            </div>
            <div className={styles.issueItem}>
              <span className={styles.issueRank}>3</span>
              <span className={styles.issueTitle}>광주 금호타이어 공장 화재</span>
              <span className={styles.issueCount}>281 공감</span>
            </div>
          </div>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('home')
            router.push('/home')
          }}
        >
          <Icon name={activeTab === 'home' ? 'home-true' : 'home-false'} size={20} />
          <span>홈</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <Icon name={activeTab === 'stats' ? 'analysis-true' : 'analysis-false'} size={20} />
          <span>통계</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'report' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('report')
            router.push('/report')
          }}
        >
          <Icon name="upload-false" size={20} />
          <span>제보</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'favorites' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('favorites')
            router.push('/favorites')
          }}
        >
          <Icon name={activeTab === 'favorites' ? 'favorite-true' : 'favorite-false'} size={20} />
          <span>관심 지역</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('profile')
            router.push('/profile')
          }}
        >
          <Icon name={activeTab === 'profile' ? 'my-true' : 'my-false'} size={20} />
          <span>내정보</span>
        </button>
      </nav>
    </div>
  )
}