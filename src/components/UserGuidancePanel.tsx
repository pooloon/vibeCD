import { useMemo } from "react";
import { getCountryPack } from "../data/countries";
import type { User } from "../types";
import { buildUserGuidance } from "../utils/guidance";
import { calcAgeFromBirthYear } from "../utils/birthYear";

interface UserGuidancePanelProps {
  user: User;
  retirementAge: number;
}

export default function UserGuidancePanel({ user, retirementAge }: UserGuidancePanelProps) {
  const pack = useMemo(() => getCountryPack(user.countryCode), [user.countryCode]);
  const guidance = useMemo(
    () => buildUserGuidance(user.countryCode, user.birthYear, retirementAge),
    [user.countryCode, user.birthYear, retirementAge],
  );
  const age = calcAgeFromBirthYear(user.birthYear);

  if (!pack || !guidance || age === null) return null;

  return (
    <section className="guidance-panel">
      <div className="guidance-header">
        <h2>
          {pack.flag} {user.name}님 맞춤 안내
        </h2>
        <span className="badge">{guidance.lifeStage}</span>
      </div>
      <p className="guidance-summary">{guidance.summary}</p>

      <div className="guidance-grid">
        <div className="guidance-block">
          <h3>우선순위</h3>
          <ul>
            {guidance.priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="guidance-block">
          <h3>절세·우대 계좌</h3>
          <ul>
            {guidance.accounts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="guidance-block">
          <h3>추천 금융사</h3>
          <ul>
            {guidance.brokers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="guidance-block">
          <h3>마일스톤</h3>
          <ul>
            {guidance.milestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="guidance-note">
        {pack.code} Reference Pack · {pack.publicPension} · 기준 은퇴 {retirementAge}세 · 투자
        참고용
      </p>
    </section>
  );
}
