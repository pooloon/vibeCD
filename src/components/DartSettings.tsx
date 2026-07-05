import { useState } from "react";
import { hasDartApiKey, saveDartApiKey } from "../services/dartService";

export default function DartSettings() {
  const [key, setKey] = useState(() => localStorage.getItem("dart_api_key") ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveDartApiKey(key);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="panel dart-settings">
      <h2>Open DART · 전자공시 연동</h2>
      <p className="panel-desc">
        <a href="https://opendart.fss.or.kr/" target="_blank" rel="noreferrer">
          opendart.fss.or.kr
        </a>
        에서 API 키를 발급받아 입력하세요. 공시·기업개요 조회에 사용됩니다.
        {import.meta.env.VITE_DART_API_KEY ? " (.env 키 설정됨)" : ""}
      </p>
      <div className="field-row">
        <div className="field">
          <label htmlFor="dart-key">DART API Key</label>
          <input
            id="dart-key"
            type="password"
            placeholder="40자 인증키"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>
        <button type="button" className="btn primary" onClick={handleSave}>
          {saved ? "저장됨 ✓" : "키 저장"}
        </button>
      </div>
      {!hasDartApiKey() && !import.meta.env.VITE_DART_API_KEY ? (
        <p className="hint-box">API 키 없으면 KRX 종목은 조회되지만 공시는 표시되지 않습니다.</p>
      ) : null}
    </section>
  );
}
