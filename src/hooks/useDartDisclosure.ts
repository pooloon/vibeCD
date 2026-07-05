import { useCallback, useState } from "react";
import {
  fetchCompanySummary,
  fetchDisclosures,
  getDartApiKey,
  hasDartApiKey,
  saveDartApiKey,
} from "../services/dartService";
import type { DartCompanySummary, DartDisclosure } from "../types/krxDart";

export function useDartDisclosure() {
  const [disclosures, setDisclosures] = useState<DartDisclosure[]>([]);
  const [company, setCompany] = useState<DartCompanySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const loadForStock = useCallback(async (stockCode: string) => {
    if (!stockCode) {
      setSelectedCode(null);
      setDisclosures([]);
      setCompany(null);
      setError(null);
      return;
    }
    if (!hasDartApiKey()) {
      setError("Open DART API 키를 설정해 주세요.");
      return;
    }
    setSelectedCode(stockCode);
    setLoading(true);
    setError(null);
    try {
      const [list, summary] = await Promise.all([
        fetchDisclosures(stockCode),
        fetchCompanySummary(stockCode),
      ]);
      setDisclosures(list);
      setCompany(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "공시 조회 실패");
      setDisclosures([]);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    disclosures,
    company,
    loading,
    error,
    selectedCode,
    loadForStock,
    hasApiKey: hasDartApiKey(),
    apiKey: getDartApiKey(),
    saveApiKey: saveDartApiKey,
  };
}
