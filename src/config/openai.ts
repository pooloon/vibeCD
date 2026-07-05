import {
  getStoredApiKey,
  getStoredProxyUrl,
  hasStoredOpenAIAccess,
} from "../services/apiKeyStore";

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  proxyUrl: string;
}

const DEFAULT_MODEL = "gpt-4o-mini";

export function getOpenAIConfig(): OpenAIConfig {
  return {
    apiKey: getStoredApiKey(),
    model: DEFAULT_MODEL,
    proxyUrl: getStoredProxyUrl(),
  };
}

export function hasOpenAIKey(): boolean {
  return hasStoredOpenAIAccess();
}
