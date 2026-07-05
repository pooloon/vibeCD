export default function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="footer-copy">
        © 2024 Nationality Engine. All Rights Reserved. Data provided by KRX, DART, and Yahoo Finance.
      </p>
      <nav className="footer-links" aria-label="법적 고지">
        <span>Legal Disclaimer</span>
        <span>Privacy Policy</span>
        <span>Data Attribution</span>
        <span>Contact Support</span>
      </nav>
      <p className="footer-disclaimer">투자 참고용 · 수익 보장 없음</p>
    </footer>
  );
}
