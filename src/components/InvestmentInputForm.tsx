import { useMemo, useState } from "react";
import { formatPromptPayload, getCountryPack } from "../data/countries";
import type { InvestmentFormData, User } from "../types";

interface InvestmentInputFormProps {
  user: User;
  form: InvestmentFormData;
  setForm: React.Dispatch<React.SetStateAction<InvestmentFormData>>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="form-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {hint ? <span className="field-hint">{hint}</span> : null}
      {children}
    </div>
  );
}

export default function InvestmentInputForm({ user, form, setForm }: InvestmentInputFormProps) {
  const [copied, setCopied] = useState(false);
  const pack = useMemo(() => getCountryPack(user.countryCode), [user.countryCode]);

  if (!pack) return null;

  const update = <K extends keyof InvestmentFormData>(key: K, value: InvestmentFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateExtra = (id: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      extraFields: { ...prev.extraFields, [id]: value },
    }));
  };

  const toggleAccount = (account: string) => {
    setForm((prev) => ({
      ...prev,
      accounts: prev.accounts.includes(account)
        ? prev.accounts.filter((a) => a !== account)
        : [...prev.accounts, account],
    }));
  };

  const payload = useMemo(() => formatPromptPayload(user, form), [user, form]);

  const copyPayload = async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="form-layout">
      <form className="input-form" onSubmit={(e) => e.preventDefault()}>
        <Section title={`1. 재무 — ${pack.currencySymbol} (${pack.currency})`}>
          <p className="section-note">
            국적·나이는 회원 프로필({pack.flag} {pack.label}) 기준으로 자동 적용됩니다.
          </p>
          <Field label={`현재 투자 가능 자산 (${pack.currencySymbol})`} htmlFor="assets">
            <input
              id="assets"
              type="text"
              placeholder={pack.code === "KOR" ? "예: 5,000만 원" : "현지 통화 기준"}
              value={form.assets}
              onChange={(e) => update("assets", e.target.value)}
            />
          </Field>
          <Field label={`월 적립 가능액 (${pack.currencySymbol})`} htmlFor="monthly">
            <input
              id="monthly"
              type="text"
              placeholder={pack.code === "KOR" ? "예: 100만 원" : ""}
              value={form.monthlyContribution}
              onChange={(e) => update("monthlyContribution", e.target.value)}
            />
          </Field>
          <div className="field-row">
            <Field label="은퇴 희망 나이" htmlFor="retire">
              <input
                id="retire"
                type="number"
                min={40}
                max={80}
                value={form.retirementAge}
                onChange={(e) => update("retirementAge", e.target.value)}
              />
            </Field>
            <Field label={`은퇴 후 월 생활비 (${pack.currencySymbol})`} htmlFor="expense">
              <input
                id="expense"
                type="text"
                placeholder={pack.code === "KOR" ? "예: 300만 원" : ""}
                value={form.monthlyExpense}
                onChange={(e) => update("monthlyExpense", e.target.value)}
              />
            </Field>
          </div>
          <Field label={`공적·사적 연금 예상 (${pack.publicPension})`} htmlFor="pension">
            <input
              id="pension"
              type="text"
              placeholder="과소 추정 권장 · 모르면 비워두세요"
              value={form.pensionEstimate}
              onChange={(e) => update("pensionEstimate", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="2. 계좌·플랫폼">
          <Field label="보유 절세·우대 계좌">
            <div className="checkbox-grid">
              {pack.taxAccounts.map((account) => (
                <label key={account} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={form.accounts.includes(account)}
                    onChange={() => toggleAccount(account)}
                  />
                  {account}
                </label>
              ))}
            </div>
          </Field>

          {pack.extraAccountFields.map((field) => (
            <Field key={field.id} label={field.label} htmlFor={field.id}>
              <input
                id={field.id}
                type="text"
                placeholder={field.placeholder}
                value={form.extraFields[field.id] ?? ""}
                onChange={(e) => updateExtra(field.id, e.target.value)}
              />
            </Field>
          ))}

          <Field label="잔여 한도 (종합)" htmlFor="limits">
            <input
              id="limits"
              type="text"
              value={form.accountLimits}
              onChange={(e) => update("accountLimits", e.target.value)}
            />
          </Field>

          <Field label="선호·사용 증권사/앱" htmlFor="broker">
            <select
              id="broker"
              value={form.preferredBroker}
              onChange={(e) => update("preferredBroker", e.target.value)}
            >
              <option value="">선택 (또는 아래 직접 입력)</option>
              {pack.brokers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <input
              className="mt-sm"
              type="text"
              placeholder="직접 입력"
              value={
                form.preferredBroker && !pack.brokers.includes(form.preferredBroker)
                  ? form.preferredBroker
                  : ""
              }
              onChange={(e) => update("preferredBroker", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="3. 투자 성향·대체자산">
          <div className="field-row">
            <Field label="위험 성향" htmlFor="risk">
              <select
                id="risk"
                value={form.riskProfile}
                onChange={(e) =>
                  update("riskProfile", e.target.value as InvestmentFormData["riskProfile"])
                }
              >
                <option value="">미입력</option>
                <option value="conservative">안정형</option>
                <option value="moderate">중립형</option>
                <option value="aggressive">공격형</option>
              </select>
            </Field>
            <Field label="해외(글로벌·미국) 비중 목표 (%)" htmlFor="foreign">
              <input
                id="foreign"
                type="number"
                min={0}
                max={100}
                value={form.foreignWeight}
                onChange={(e) => update("foreignWeight", e.target.value)}
              />
            </Field>
          </div>

          <div className="checkbox-grid">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.allowGold}
                onChange={(e) => update("allowGold", e.target.checked)}
              />
              금 허용
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.allowSilver}
                onChange={(e) => update("allowSilver", e.target.checked)}
              />
              은 허용
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.allowBtc}
                onChange={(e) => update("allowBtc", e.target.checked)}
              />
              BTC 허용
            </label>
          </div>

          {form.allowBtc && (
            <Field label="BTC 포트폴리오 상한 (%)" htmlFor="btcCap">
              <input
                id="btcCap"
                type="number"
                min={0}
                max={20}
                value={form.btcCap}
                onChange={(e) => update("btcCap", e.target.value)}
              />
            </Field>
          )}

          <Field label="환전 / FX 선호" htmlFor="fx">
            <select
              id="fx"
              value={form.fxPreference}
              onChange={(e) =>
                update("fxPreference", e.target.value as InvestmentFormData["fxPreference"])
              }
            >
              <option value="">미입력</option>
              <option value="local-dca">{pack.currency} DCA (현지 통화 적립)</option>
              <option value="usd-dca">USD DCA</option>
              <option value="hedged-etf">환헤지 ETF 선호</option>
            </select>
          </Field>

          {pack.code === "KOR" && (
            <Field label="금융소득 종합과세 해당" htmlFor="compTax">
              <select
                id="compTax"
                value={form.comprehensiveTax}
                onChange={(e) =>
                  update(
                    "comprehensiveTax",
                    e.target.value as InvestmentFormData["comprehensiveTax"],
                  )
                }
              >
                <option value="">미입력</option>
                <option value="yes">해당</option>
                <option value="no">해당 없음</option>
                <option value="unknown">모름</option>
              </select>
            </Field>
          )}
        </Section>

        <div className="form-actions">
          <button type="button" className="btn primary" onClick={copyPayload}>
            {copied ? "복사됨 ✓" : "Cursor용 프롬프트 복사"}
          </button>
        </div>
      </form>

      <aside className="preview-panel">
        <div className="preview-header">
          <h2>미리보기</h2>
          <span className="badge">{pack.code} Pack</span>
        </div>
        <pre className="preview-body">{payload}</pre>
        <p className="preview-note">
          회원 프로필 + 재무 입력이 포함됩니다. Cursor 채팅에 붙여넣으세요.
          <br />
          Skill: <code>/integrated-investment-planning</code>
        </p>
      </aside>
    </div>
  );
}
