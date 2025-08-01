'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/icons/Icon'
import styles from './stats.module.scss'

export default function StatsPage() {
  const [selectedYear, setSelectedYear] = useState('2025년')
  const [selectedRegion, setSelectedRegion] = useState('경남')
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState('stats')
  const router = useRouter()

  const regions = ['전체', '강원도', '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도']
  
  const monthlyData = [
    { month: '1월', value: 15, height: 35 },
    { month: '2월', value: 25, height: 50 },
    { month: '3월', value: 18, height: 40 },
    { month: '4월', value: 32, height: 65 },
    { month: '5월', value: 40, height: 100, active: true },
    { month: '6월', value: 28, height: 45 },
    { month: '7월', value: 20, height: 35 }
  ]

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
        {/* 년도/지역 선택 */}
        <div className={styles.dateSelector}>
          <div className={styles.dropdown}>
            <span>{selectedYear}</span>
            <Icon name="chevron-down" size={16} />
          </div>
          <div className={styles.dropdown} onClick={() => setShowRegionDropdown(!showRegionDropdown)}>
            <span>{selectedRegion}</span>
            <Icon name="chevron-down" size={16} />
            {showRegionDropdown && (
              <div className={styles.dropdownMenu}>
                {regions.map((region) => (
                  <div 
                    key={region}
                    className={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedRegion(region)
                      setShowRegionDropdown(false)
                    }}
                  >
                    {region}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 월별 이슈 발생 추이 */}
        <div className={styles.chartSection}>
          <h3 className={styles.sectionTitle}>월별 이슈 발생 추이</h3>
          <div className={styles.barChart}>
            <div className={styles.chartBars}>
              {monthlyData.map((data, index) => (
                <div key={data.month} className={styles.barContainer}>
                  <div className={styles.barWrapper}>
                    <div 
                      className={`${styles.bar} ${data.active ? styles.activeBar : ''}`}
                      style={{ height: `${data.height}%` }}
                    ></div>
                  </div>
                  <span className={`${styles.barLabel} ${data.active ? styles.activeLabel : ''}`}>
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.chartFooter}>
              <span className={styles.chartPeriod}>지난 6개월 평균</span>
              <span className={styles.chartValue}>24건</span>
            </div>
          </div>
        </div>

        {/* 시간대별 이슈 발생 추이 */}
        <div className={styles.chartSection}>
          <h3 className={styles.sectionTitle}>시간대별 이슈 발생 추이</h3>
          <div className={styles.lineChart}>
            <div className={styles.chartArea}>
              <svg viewBox="0 0 320 120" className={styles.lineChartSvg}>
                {/* 격자 배경 */}
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="320" height="120" fill="url(#grid)" />
                
                {/* 라인 차트 */}
                <path
                  d="M20,90 L60,75 L100,85 L140,70 L180,40 L220,65 L260,80 L300,70"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* 포인트들 */}
                <circle cx="20" cy="90" r="3" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <circle cx="60" cy="75" r="3" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <circle cx="100" cy="85" r="3" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <circle cx="140" cy="70" r="3" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <circle cx="180" cy="40" r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <circle cx="220" cy="65" r="3" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <circle cx="260" cy="80" r="3" fill="#3b82f6" stroke="white" strokeWidth="2" />
                <circle cx="300" cy="70" r="3" fill="#3b82f6" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className={styles.chartLabels}>
              <span>오전 12시</span>
              <span>오전 6시</span>
              <span>오후 12시</span>
              <span>오후 6시</span>
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
          <Icon name={activeTab === 'home' ? 'home-true' : 'home-false'} size={24} />
          <span>홈</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <Icon name={activeTab === 'stats' ? 'analysis-true' : 'analysis-false'} size={24} />
          <span>통계</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'report' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('report')
            router.push('/report')
          }}
        >
          <Icon name="upload-false" size={24} />
          <span>제보</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'favorites' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('favorites')
            router.push('/favorites')
          }}
        >
          <Icon name={activeTab === 'favorites' ? 'favorite-true' : 'favorite-false'} size={24} />
          <span>관심 지역</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('profile')
            router.push('/profile')
          }}
        >
          <Icon name={activeTab === 'profile' ? 'my-true' : 'my-false'} size={24} />
          <span>내정보</span>
        </button>
      </nav>
    </div>
  )
}