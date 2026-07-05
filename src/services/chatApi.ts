import { getOpenAIConfig } from "../config/openai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
}

const SYSTEM_PROMPT = `당신은 "연습실 관리(Room Manager)" 앱의 AI 도우미입니다.
연습실 14개 방(1, 2, 3, 4, 7, 8, 9, 10, 13, 14, 15, 16, 17, S)의 월단위 계약, 수입·지출, 캘린더, 방 현황 관리를 돕습니다.
한국어로 간결하고 친절하게 답변하세요. 앱 사용법, 운영 팁, 손익·계약 관련 일반 조언을 제공합니다.
모르는 내용은 추측하지 말고, 앱 내 해당 메뉴(캘린더, 방현황, 계약서, 수입지출, 설정)를 안내하세요.`;

function resolveEndpoint(): { url: string; useProxy: boolean } {
  const { proxyUrl } = getOpenAIConfig();
  const trimmedProxy = proxyUrl.trim();

  if (trimmedProxy) {
    return { url: trimmedProxy, useProxy: true };
  }

  if (import.meta.env.DEV) {
    return { url: "/openai-api/v1/chat/completions", useProxy: true };
  }

  return { url: "https://api.openai.com/v1/chat/completions", useProxy: false };
}

export async function sendChatMessage(
  history: ChatMessage[],
  userText: string,
): Promise<string> {
  const { apiKey, model } = getOpenAIConfig();
  const { url, useProxy } = resolveEndpoint();

  if (!useProxy && !apiKey.trim()) {
    throw new Error(
      "API 키가 없습니다. 설정 탭 → AI 도우미에서 OpenAI API 키를 저장하세요.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!useProxy || (import.meta.env.DEV && !getOpenAIConfig().proxyUrl.trim())) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }

  const body = {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.filter((m) => m.role !== "system"),
      { role: "user", content: userText },
    ],
    temperature: 0.7,
    max_tokens: 800,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  let data: ChatCompletionResponse;
  try {
    data = (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new Error("서버 응답을 읽을 수 없습니다.");
  }

  if (!response.ok) {
    const msg =
      data.error?.message ??
      (response.status === 401
        ? "API 키가 올바르지 않습니다."
        : `요청 실패 (${response.status})`);
    throw new Error(msg);
  }

  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("응답 내용이 비어 있습니다.");
  }

  return reply;
}
