import { useMemo, useState, type FormEvent } from "react";
import { COUNTRIES, getCountryPack } from "../data/countries";
import { useAuth } from "../context/AuthContext";
import type { CountryCode, Gender } from "../types";
import {
  getBirthYearFieldLabel,
  getBirthYearHint,
  getBirthYearOptions,
  getBirthYearPlaceholder,
} from "../utils/birthYear";

type SignupStep = "account" | "profile";

export default function SignupForm({ onSwitchLogin }: { onSwitchLogin: () => void }) {
  const { signUp } = useAuth();
  const [step, setStep] = useState<SignupStep>("account");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode | "">("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [residence, setResidence] = useState("");
  const [error, setError] = useState("");

  const pack = useMemo(() => (countryCode ? getCountryPack(countryCode) : null), [countryCode]);
  const birthYearOptions = useMemo(
    () => (countryCode ? getBirthYearOptions(countryCode) : []),
    [countryCode],
  );

  const handleAccountNext = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setStep("profile");
  };

  const handleCountrySelect = (code: CountryCode) => {
    setCountryCode(code);
    setBirthYear("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!countryCode) {
      setError("국적·출신 국가를 선택해 주세요.");
      return;
    }
    if (!birthYear) {
      setError("출생연도를 선택해 주세요.");
      return;
    }
    try {
      signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        countryCode,
        birthYear,
        gender,
        residence: residence.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    }
  };

  if (step === "account") {
    return (
      <form className="auth-form" onSubmit={handleAccountNext}>
        <div className="auth-form-top">
          <div className="step-progress" aria-hidden="true">
            <span className="step-progress-fill" />
            <span className="step-progress-empty" />
          </div>
          <span className="step-counter">Step 01 / 02</span>
        </div>

        <h2>Account Credentials</h2>
        <p className="auth-desc">계정 정보와 기본 연락처를 등록합니다.</p>

        <div className="field">
          <label htmlFor="signup-name">이름</label>
          <input
            id="signup-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="signup-email">이메일</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="signup-password">비밀번호</label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="signup-confirm">비밀번호 확인</label>
            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="auth-form-actions">
          <button type="submit" className="btn primary">
            Continue to Profile →
          </button>
        </div>

        <p className="auth-switch">
          이미 계정이 있으신가요?{" "}
          <button type="button" className="link-btn" onClick={onSwitchLogin}>
            로그인
          </button>
        </p>
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-top">
        <div className="step-progress" aria-hidden="true">
          <span className="step-progress-fill full" />
        </div>
        <span className="step-counter">Step 02 / 02</span>
      </div>

      <h2>Profile & Nationality</h2>
      <p className="auth-desc">국적·출생연도를 선택하면 Reference Pack이 자동 적용됩니다.</p>

      <div className="field">
        <span className="field-label-block">국적·세법 기준 국가 (출신)</span>
        <div className="country-grid">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              className={`country-card ${countryCode === c.code ? "selected" : ""}`}
              onClick={() => handleCountrySelect(c.code)}
            >
              <span className="country-card-flag">{c.flag}</span>
              <span className="country-card-label">{c.label}</span>
              <span className="country-card-code">{c.code}</span>
            </button>
          ))}
        </div>
      </div>

      {pack ? (
        <div className="pack-banner slide-in" role="status">
          <strong>
            {pack.flag} {pack.label} Reference Pack
          </strong>
          <p>통화: {pack.currency} · 기본 은퇴: {pack.defaultRetirementAge}세</p>
        </div>
      ) : null}

      {countryCode ? (
        <div className="slide-in">
          <div className="field-row">
            <div className="field">
              <label htmlFor="signup-birth">{getBirthYearFieldLabel(countryCode)}</label>
              <span className="field-hint">{getBirthYearHint(countryCode)}</span>
              <select
                id="signup-birth"
                required
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              >
                <option value="">{getBirthYearPlaceholder(countryCode)}</option>
                {birthYearOptions.map((option) => (
                  <option key={option.year} value={String(option.year)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="signup-gender">성별 (선택)</label>
              <span className="field-hint">연금·수명 가정 참고</span>
              <select
                id="signup-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="">미입력</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타/미공개</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="signup-residence">실제 거주지 (선택)</label>
            <input
              id="signup-residence"
              placeholder={pack ? `예: ${pack.label} 거주` : ""}
              value={residence}
              onChange={(e) => setResidence(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <p className="hint-box">국적을 선택하면 해당 국가 기준 출생연도 목록이 표시됩니다.</p>
      )}

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions-row">
        <button type="button" className="btn" onClick={() => setStep("account")}>
          이전
        </button>
        <button type="submit" className="btn primary" disabled={!countryCode || !birthYear}>
          가입 완료
        </button>
      </div>
    </form>
  );
}
