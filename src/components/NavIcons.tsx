type IconProps = { className?: string };

export function IconCalendar({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden>
      <rect x="1" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 7h16M5 1v3M13 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconRooms({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconContract({ className }: IconProps) {
  return (
    <svg className={className} width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden>
      <path d="M3 1h7l5 5v13H3V1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 10h6M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconLedger({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden>
      <rect x="1" y="1" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6h6M12 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
