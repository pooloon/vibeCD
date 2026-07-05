import { useEffect, useState } from "react";
import {
  clearStoredApiKey,
  getStoredApiKey,
  getStoredProxyUrl,
  maskApiKey,
  saveOpenAISettings,
} from "../services/apiKeyStore";

export default function OpenAISettingsSection() {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [proxyUrlInput, setProxyUrlInput] = useState("");
  const [savedKey, setSavedKey] = useState(getStoredApiKey());
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSavedKey(getStoredApiKey());
    setProxyUrlInput(getStoredProxyUrl());
  }, []);

  const handleSave = () => {
    if (!apiKeyInput.trim() && !savedKey && !proxyUrlInput.trim()) {
      setMessage("API 키 또는 프록시 URL 중 하나 이상을 입력하세요.");
      return;
    }

    try {
      saveOpenAISettings(apiKeyInput, proxyUrlInput);
      setSavedKey(getStoredApiKey());
      setProxyUrlInput(getStoredProxyUrl());
      setApiKeyInput("");
      setMessage("AI 설정을 이 기기에 저장했습니다. GitHub에는 올라가지 않습니다.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  };

  const handleClearKey = () => {
    clearStoredApiKey();
    setSavedKey("");
    setApiKeyInput("");
    setMessage("API 키를 삭제했습니다.");
  };

  return (
    <div>
      <p className="section-label">AI 도우미</p>
      <div className="card form-card">
        <p className="settings-note">
          OpenAI API 키는 <strong>이 브라우저에만</strong> 저장됩니다. 소스 코드·GitHub에
          포함되지 않습니다.
        </p>

        {savedKey && (
          <p className="settings-saved-key">
            저장된 키: <code>{maskApiKey(savedKey)}</code>
          </p>
        )}

        <div className="field">
          <label htmlFor="openai-api-key">OpenAI API 키</label>
          <input
            id="openai-api-key"
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={savedKey ? "새 키로 교체하려면 입력" : "sk-..."}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field">
          <label htmlFor="openai-proxy-url">프록시 URL (선택)</label>
          <input
            id="openai-proxy-url"
            type="url"
            value={proxyUrlInput}
            onChange={(e) => setProxyUrlInput(e.target.value)}
            placeholder="https://your-worker.example.com/chat"
            autoComplete="off"
          />
          <p className="field-hint">
            GitHub Pages 등 공개 배포에서 CORS 오류가 나면, API 키를 서버에 둔 프록시
            주소를 입력하세요.
          </p>
        </div>

        <div className="btn-row settings-actions">
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            저장
          </button>
          {savedKey && (
            <button type="button" className="btn btn-secondary" onClick={handleClearKey}>
              키 삭제
            </button>
          )}
        </div>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
