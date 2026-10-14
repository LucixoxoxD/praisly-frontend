const paths = {
  dashboard: <><rect x="3" y="3" width="7" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="3" y="15" width="7" height="6" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /></>,
  reviews: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />,
  qr: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><path d="M15 15h3v3h3v3h-6v-3M21 12v2M12 3v3M3 12h3M12 12v3" /></>,
  message: <path d="M21 14a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z M7 8h10M7 12h6" />,
  settings: <><path d="M4 7h5m6 0h5M4 17h9m6 0h1" /><circle cx="12" cy="7" r="3" /><circle cx="16" cy="17" r="3" /></>,
  billing: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>,
}

export default function WorkspaceIcon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>{paths[name]}</svg>
}
