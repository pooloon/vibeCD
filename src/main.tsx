import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ensureSeedData } from "./db";
import "./index.css";

async function bootstrap() {
  await ensureSeedData();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
