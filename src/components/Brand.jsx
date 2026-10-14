import { Link } from 'react-router-dom'
import './AppBrand.css'

export default function Brand({ to = '/', onClick }) {
  return <Link to={to} onClick={onClick} className="app-brand" aria-label="Praisly home">
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="m50 0 8 33 28-19-19 28 33 8-33 8 19 28-28-19-8 33-8-33-28 19 19-28L0 50l33-8-19-28 28 19Z" /></svg>
    <span>praisly<span className="app-brand-dot">.</span></span>
  </Link>
}
