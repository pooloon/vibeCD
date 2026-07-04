import { useState } from "react";
import CalendarPage from "./pages/CalendarPage";
import ContractPage from "./pages/ContractPage";
import LedgerPage from "./pages/LedgerPage";
import RoomsPage from "./pages/RoomsPage";
import SummaryPage from "./pages/SummaryPage";
import { todayParts } from "./utils";

type Tab = "calendar" | "rooms" | "contract" | "ledger" | "summary";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "calendar", label: "캘린더", icon: "📅" },
  { id: "rooms", label: "방현황", icon: "🚪" },
  { id: "contract", label: "계약서", icon: "📝" },
  { id: "ledger", label: "수입지출", icon: "💰" },
  { id: "summary", label: "합계", icon: "📊" },
];

export default function App() {
  const today = todayParts();
  const [tab, setTab] = useState<Tab>("calendar");
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);

  return (
    <div className="app-shell">
      {tab === "calendar" && (
        <CalendarPage
          year={year}
          month={month}
          onMonthChange={(nextYear, nextMonth) => {
            setYear(nextYear);
            setMonth(nextMonth);
          }}
        />
      )}
      {tab === "rooms" && <RoomsPage />}
      {tab === "contract" && <ContractPage />}
      {tab === "ledger" && <LedgerPage />}
      {tab === "summary" && <SummaryPage />}

      <nav className="bottom-nav" aria-label="주요 메뉴">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-btn ${tab === item.id ? "active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
