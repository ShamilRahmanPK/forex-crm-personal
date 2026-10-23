// Line icons drawn on a 24px grid with currentColor strokes.
function Icon({ size = 24, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const ChevronDown = (p) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)

export const ChevronsLeft = (p) => (
  <Icon {...p}>
    <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
  </Icon>
)

export const Eye = (p) => (
  <Icon {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const EyeClosed = (p) => (
  <Icon {...p}>
    <path d="M3 10c2.2 2.6 5.3 4 9 4s6.8-1.4 9-4M6.5 12.6 5 15M17.5 12.6 19 15M12 14v2.8M9 13.7l-.8 2.7M15 13.7l.8 2.7" />
  </Icon>
)

export const Check = (p) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const Globe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </Icon>
)

export const HelpCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4M12 17h.01" />
  </Icon>
)

export const Bell = (p) => (
  <Icon {...p}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0" />
  </Icon>
)

export const Apps = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    {[5, 12, 19].flatMap((y) =>
      [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />),
    )}
  </Icon>
)

export const UserCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.5 18.5c1.2-2 3.2-3 5.5-3s4.3 1 5.5 3" />
  </Icon>
)

export const Wallet = (p) => (
  <Icon {...p}>
    <path d="M4 7.5V18a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h11v4" />
    <path d="M16 14h.01" />
  </Icon>
)

export const Trading = (p) => (
  <Icon {...p}>
    <path d="M7 3v3M7 15v6M17 3v6M17 18v3" />
    <rect x="4.5" y="6" width="5" height="9" rx="1" />
    <rect x="14.5" y="9" width="5" height="9" rx="1" />
  </Icon>
)

export const Analytics = (p) => (
  <Icon {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 3v18M11.5 8H16M11.5 12H16M11.5 16H14" />
  </Icon>
)

export const Award = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="M4 21c1.3-3.3 4.4-5.5 8-5.5s6.7 2.2 8 5.5" />
  </Icon>
)

export const Heart = (p) => (
  <Icon {...p}>
    <path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20Z" />
  </Icon>
)

export const Settings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
)

export const Users = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5M16 4.6a3.5 3.5 0 0 1 0 6.8M18 15.3c1.8.7 3 2.4 3.5 4.7" />
  </Icon>
)

export const Plus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const Sort = (p) => (
  <Icon {...p}>
    <path d="M4 8h9M4 12h6M4 16h3M17 19V5m0 0-3 3m3-3 3 3" />
  </Icon>
)

export const List = (p) => (
  <Icon {...p}>
    <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
  </Icon>
)

export const Grid = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </Icon>
)

export const ArrowDownCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v9m0 0-3.5-3.5m3.5 3.5 3.5-3.5" />
  </Icon>
)

export const ArrowUpRightCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 15l6-6m0 0H10m5 0v5" />
  </Icon>
)

export const Transfer = (p) => (
  <Icon {...p}>
    <path d="M4 8h15m0 0-4-4m4 4-4 4M20 16H5m0 0 4-4m-4 4 4 4" />
  </Icon>
)

export const MoreVertical = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </Icon>
)

export const Chat = (p) => (
  <Icon {...p}>
    <path d="M4 5h16v11H9l-5 4V5Z" />
    <path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" strokeWidth="2.4" />
  </Icon>
)

export const Close = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
)

export const Menu = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const GoogleLogo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5Z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z" />
  </svg>
)

export const AlertTriangle = (p) => (
  <Icon {...p}>
    <path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0ZM12 9.5v4M12 17h.01" />
  </Icon>
)

export const CheckCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m8 12.5 2.8 2.8L16.5 9.5" />
  </Icon>
)

export const ChevronRight = (p) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
)

export const ChevronLeft = (p) => (
  <Icon {...p}>
    <path d="m15 6-6 6 6 6" />
  </Icon>
)

export const Copy = (p) => (
  <Icon {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </Icon>
)

export const Pencil = (p) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />
  </Icon>
)

export const ExternalLink = (p) => (
  <Icon {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Icon>
)

export const Lock = (p) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2" />
  </Icon>
)

export const Cube = (p) => (
  <Icon {...p}>
    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5l8 4.5 8-4.5M12 12v9" />
  </Icon>
)

export const Layers = (p) => (
  <Icon {...p}>
    <path d="M12 3 21 8l-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 17l9 5 9-5" />
  </Icon>
)

export const Curve = (p) => (
  <Icon {...p}>
    <path d="M4 20c6 0 6-16 16-16" />
  </Icon>
)

export const TypeIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7V5h11v2M9.5 5v14M7 19h5M14 12v-1.5h7V12M17.5 10.5V19M16 19h3" />
  </Icon>
)

export const Download = (p) => (
  <Icon {...p}>
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
  </Icon>
)

export const Archive = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="4" width="17" height="4.5" rx="1" />
    <path d="M5 8.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5M10 12.5h4" />
  </Icon>
)

export const Mail = (p) => (
  <Icon {...p}>
    <path d="M3.5 10 12 4l8.5 6v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9Z" />
    <path d="m3.5 10 8.5 6 8.5-6" />
  </Icon>
)

export const Phone = (p) => (
  <Icon {...p}>
    <rect x="7" y="3" width="10" height="18" rx="2" />
    <path d="M11 18h2" />
  </Icon>
)

export const Clipboard = (p) => (
  <Icon {...p}>
    <rect x="5" y="4.5" width="14" height="16" rx="2" />
    <path d="M9 4.5V3.5h6v1M8.5 10h.01M11 10h4.5M8.5 14h.01M11 14h4.5" />
  </Icon>
)

export const AtSign = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </Icon>
)

export const CreditCard = (p) => (
  <Icon {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </Icon>
)

export const Coin = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 8.5h7M12 8.5v8M9 12h6" />
  </Icon>
)

export const Diamond = (p) => (
  <Icon {...p}>
    <path d="M12 3 21 12l-9 9-9-9 9-9ZM12 8l4 4-4 4-4-4 4-4Z" />
  </Icon>
)

export const Bank = (p) => (
  <Icon {...p}>
    <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />
  </Icon>
)

export const Target = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </Icon>
)

export const HalfCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18" />
  </Icon>
)

export const Gauge = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 14 4-5 4 5" />
  </Icon>
)

export const Info = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.5h.01" />
  </Icon>
)

export const Inbox = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="4" width="17" height="16" rx="3" />
    <path d="M3.5 13h4.5l1.5 2.5h5L16 13h4.5" />
  </Icon>
)

export const Search = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.4-4.4" />
  </Icon>
)

export const SearchQuestion = (p) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="7" />
    <path d="m21 21-5.5-5.5M8.5 8.8a2 2 0 1 1 2.8 1.8c-.5.2-.8.7-.8 1.2v.4M10.5 14.5h.01" />
  </Icon>
)

export const AlertCircle = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.5h.01" />
  </Icon>
)

export const LogOut = (p) => (
  <Icon {...p}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 16l4-4-4-4M19 12H9" />
  </Icon>
)

export const Trash = (p) => (
  <Icon {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.5h6.4a1.5 1.5 0 0 0 1.5-1.5l.8-12M10 11v6M14 11v6" />
  </Icon>
)

export const Upload = (p) => (
  <Icon {...p}>
    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </Icon>
)

export const FileText = (p) => (
  <Icon {...p}>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5l-5-5Z" />
    <path d="M14 3.5v5h5M9 13h6M9 16.5h4" />
  </Icon>
)

export const IdCard = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M14.5 10H18M14.5 13.5H17" />
  </Icon>
)

export const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" />
  </Icon>
)

export const Coins = (p) => (
  <Icon {...p}>
    <ellipse cx="9" cy="6.5" rx="5.5" ry="2.5" />
    <path d="M3.5 6.5v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4M3.5 10.5v4c0 1.4 2.5 2.5 5.5 2.5M14.5 12c3 0 5.5 1.1 5.5 2.5S17.5 17 14.5 17 9 15.9 9 14.5M9 14.5v3c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-3" />
  </Icon>
)

export const ScanFace = (p) => (
  <Icon {...p}>
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
    <circle cx="12" cy="10" r="2.5" />
    <path d="M8 16.5c.8-1.6 2.2-2.5 4-2.5s3.2.9 4 2.5" />
  </Icon>
)

export const Gift = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="8" width="17" height="4" rx="1" />
    <path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12M12 8v12.5M12 8S10.5 4 8 4a2 2 0 0 0 0 4h4ZM12 8s1.5-4 4-4a2 2 0 0 1 0 4h-4Z" />
  </Icon>
)

export const Server = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 12h16M8 8h.01M8 16h.01" />
  </Icon>
)

export const Calendar = (p) => (
  <Icon {...p}>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M8.5 3v4M15.5 3v4" />
  </Icon>
)

export const Signal = (p) => (
  <Icon {...p}>
    <path d="M4 20v-3M9 20v-7M14 20V9M19 20V4" />
  </Icon>
)

export const Phone2 = (p) => (
  <Icon {...p}>
    <path d="M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2 4.5 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </Icon>
)
