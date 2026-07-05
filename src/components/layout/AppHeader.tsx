import { useMemo } from "react";
import { getCountryPack } from "../../data/countries";
import type { User } from "../../types";
import { formatAgeDisplay } from "../../utils/birthYear";

interface AppHeaderProps {
  user: User;
  onSignOut: () => void;
  title: string;
  subtitle: string;
}

export default function AppHeader({ user, onSignOut, title, subtitle }: AppHeaderProps) {
  const pack = useMemo(() => getCountryPack(user.countryCode), [user.countryCode]);
  const ageDisplay = formatAgeDisplay(user.birthYear, user.countryCode);
  const initials = user.name.slice(0, 1).toUpperCase();

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <span className="app-topbar-logo">Nationality Engine</span>
      </div>

      <div className="app-topbar-center">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="app-topbar-right">
        {pack ? (
          <span className="topbar-chip" title="국적 Reference Pack">
            {pack.flag} {pack.code}
          </span>
        ) : null}
        <span className="topbar-chip muted">{ageDisplay}</span>
        <button type="button" className="avatar-btn" title={user.name} aria-label={`${user.name} 프로필`}>
          {initials}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onSignOut}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
