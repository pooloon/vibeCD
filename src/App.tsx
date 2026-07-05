import { useState } from "react";
import {
  IconCalendar,
  IconContract,
  IconLedger,
  IconRooms,
  IconSettings,
} from "./components/NavIcons";
import ChatBot from "./components/ChatBot";
import CalendarPage from "./pages/CalendarPage";
import ContractPage from "./pages/ContractPage";
import LedgerPage from "./pages/LedgerPage";
import RoomsPage from "./pages/RoomsPage";
import SummaryPage from "./pages/SummaryPage";
import { todayParts } from "./utils";

type Tab = "calendar" | "rooms" | "contract" | "ledger" | "settings";

const TABS: Array<{
  id: Tab;
  label: string;
  Icon: typeof IconCalendar;
}> = [
  { id: "calendar", label: "캘린더", Icon: IconCalendar },
  { id: "rooms", label: "방현황", Icon: IconRooms },
  { id: "contract", label: "계약서", Icon: IconContract },
  { id: "ledger", label: "수입지출", Icon: IconLedger },
  { id: "settings", label: "설정", Icon: IconSettings },
];

export default function App() {
  const today = todayParts();
  const [tab, setTab] = useState<Tab>("calendar");
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);

  const handleQuickAdd = () => {
    if (tab === "ledger") return;
    if (tab === "rooms" || tab === "calendar") {
      setTab("contract");
      return;
    }
    setTab("ledger");
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <button type="button" className="topbar-icon-btn" aria-label="메뉴">
          <span className="menu-lines" aria-hidden />
        </button>
        <h1 className="topbar-title">Room Manager</h1>
        <button
          type="button"
          className="topbar-icon-btn topbar-add"
          aria-label="빠른 추가"
          onClick={handleQuickAdd}
        >
          +
        </button>
      </header>

      <main className="app-main">
        {tab === "calendar" && (
          <>
            <ChatBot />
            <CalendarPage
              year={year}
              month={month}
              onMonthChange={(nextYear, nextMonth) => {
                setYear(nextYear);
                setMonth(nextMonth);
              }}
            />
          </>
        )}
        {tab === "rooms" && <RoomsPage />}
        {tab === "contract" && <ContractPage />}
        {tab === "ledger" && <LedgerPage />}
        {tab === "settings" && <SummaryPage />}
      </main>

      <nav className="bottom-nav" aria-label="주요 메뉴">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-btn ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon className="nav-icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
