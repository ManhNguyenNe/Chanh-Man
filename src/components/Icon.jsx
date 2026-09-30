const paths = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 7h14l1 14H4L5 7Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  laptop: (
    <>
      <rect x="5" y="4" width="14" height="12" rx="1" />
      <path d="m5 16-3 4h20l-3-4M9 20h6" />
    </>
  ),
  phone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M10 5h4M11 19h2" />
    </>
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4M18 9h4m-4 6h4M9 9h6v6H9z" />
    </>
  ),
  study: (
    <>
      <path d="m2 9 10-5 10 5-10 5L2 9ZM6 11v6q6 5 12 0v-6M22 9v8" />
    </>
  ),
  work: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V4h8v3M3 12q9 6 18 0M10 13h4" />
    </>
  ),
  game: (
    <>
      <path d="M7 8h10c5 0 7 12 3 12-2 0-3-4-5-4H9c-2 0-3 4-5 4-4 0-2-12 3-12Z" />
      <path d="M6 11v5m-2.5-2.5h5M16 12h.01M19 15h.01M12 8V4" />
    </>
  ),
  creative: (
    <>
      <path d="m14 3 7 7-11 11H3v-7L14 3ZM11 6l7 7M3 14l7 7" />
      <path d="m7 17 7-7" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 8 3v6c0 6-8 11-8 11S4 17 4 11V5l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  delivery: (
    <>
      <path d="M2 5h12v13H2zM14 9h4l4 5v4h-8" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </>
  ),
  support: (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1M4 12H2v6h4v-6H4Zm16 0h2v6h-4v-6h2ZM20 18v1q0 3-7 3" />
    </>
  ),
  return: (
    <>
      <path d="M4 4v6h6M4 10a8 8 0 1 1 0 7" />
      <path d="M12 8v5l3 2" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
}
export default function Icon({ name, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  )
}
