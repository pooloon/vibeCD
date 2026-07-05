import { useMemo } from "react";
import { getCountryPack } from "../data/countries";
import type { User } from "../types";
import { formatAgeDisplay } from "../utils/birthYear";

export default function ProfileBar({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const pack = useMemo(() => getCountryPack(user.countryCode), [user.countryCode]);
  const ageDisplay = formatAgeDisplay(user.birthYear, user.countryCode);

  if (!pack) return null;

  return (
    <div className="profile-bar" aria-live="polite">
      <div className="profile-item">
        <span className="profile-label">회원</span>
        <span className="profile-value">{user.name}</span>
      </div>
      <div className="profile-divider" aria-hidden="true" />
      <div className="profile-item">
        <span className="profile-label">국적·출신</span>
        <span className="profile-value">
          {pack.flag} {pack.label}
          <span className="profile-code">{pack.code}</span>
        </span>
      </div>
      <div className="profile-divider" aria-hidden="true" />
      <div className="profile-item">
        <span className="profile-label">나이</span>
        <span className="profile-value">{ageDisplay}</span>
      </div>
      <button type="button" className="btn btn-sm profile-logout" onClick={onSignOut}>
        로그아웃
      </button>
    </div>
  );
}
