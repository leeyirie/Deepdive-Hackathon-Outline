import Image from 'next/image'

const Icon = ({ name, size = 20, className = '' }) => {
  // icon- 접두사가 없으면 추가
  const iconName = name.startsWith('icon-') ? name : `icon-${name}`
  const iconPath = `/icons/${iconName}.svg`
  
  return (
    <Image
      src={iconPath}
      alt={name}
      width={size}
      height={size}
      className={className}
    />
  )
}

export default Icon 