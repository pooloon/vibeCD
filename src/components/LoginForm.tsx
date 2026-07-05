import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginForm({ onSwitchSignup }: { onSwitchSignup: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>로그인</h2>
      <p className="auth-desc">가입 시 등록한 국적·출생연도가 자동으로 적용됩니다.</p>

      <div className="field">
        <label htmlFor="login-email">이메일</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="login-password">비밀번호</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="btn primary btn-block">
        로그인
      </button>

      <p className="auth-switch">
        계정이 없으신가요?{" "}
        <button type="button" className="link-btn" onClick={onSwitchSignup}>
          회원가입
        </button>
      </p>
    </form>
  );
}
