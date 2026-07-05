import { useState } from "react";
import type { AuthView } from "../types";
import AppFooter from "./layout/AppFooter";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("signup");

  return (
    <div className="auth-shell">
      <header className="auth-nav">
        <div className="auth-nav-brand">
          <span className="auth-nav-icon" aria-hidden="true">
            ⬡
          </span>
          <span>Nationality Engine</span>
        </div>
        <nav className="auth-nav-links" aria-label="포털 링크">
          <span>Professional Portal</span>
          <span className="auth-nav-divider" aria-hidden="true" />
          <span>Support</span>
        </nav>
      </header>

      <div className="auth-layout">
        <div className="auth-hero">
          <p className="auth-hero-eyebrow">Retirement Authority</p>
          <h1>종목·시세·순차전략 투자 설계</h1>
          <p className="auth-hero-desc">
            Nationality Engine으로 국적·출생연도 기반 Reference Pack과 Security Engine
            (상장코드·시세·이슈·순차 매수)을 활용하세요.
          </p>

          <ul className="auth-feature-list">
            <li>
              <span className="auth-feature-badge security">Security First</span>
              <p>기업 공시(DART)·KRX 전종목·실시간 시세 연동</p>
            </li>
            <li>
              <span className="auth-feature-badge market">Multi-Market Access</span>
              <p>KOR · JPN · USA · GBR · SGP Reference Pack 지원</p>
            </li>
          </ul>
        </div>

        <div className="auth-card">
          {view === "login" ? (
            <LoginForm onSwitchSignup={() => setView("signup")} />
          ) : (
            <SignupForm onSwitchLogin={() => setView("login")} />
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
