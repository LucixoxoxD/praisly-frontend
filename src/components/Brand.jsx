import { Link } from 'react-router-dom'
import BrandMark from './BrandMark'
import './AppBrand.css'

export default function Brand({ to = '/', onClick, className = '' }) {
  return <Link to={to} onClick={onClick} className={`app-brand ${className}`} aria-label="Praisly home">
    <BrandMark />
    <span className="app-brand-name">praisly</span>
  </Link>
}
