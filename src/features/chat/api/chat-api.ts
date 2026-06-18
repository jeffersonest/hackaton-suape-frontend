import { apiClient } from "@/lib/api-client";

export interface StreamChatOptions {
  message: string;
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface AgentQueryResponse {
  message?: string;
  response?: string;
  text?: string;
}

export async function streamChat({
  message,
  onChunk,
  onComplete,
  onError,
}: StreamChatOptions): Promise<string> {
  try {
    // Passa pelo cliente central: envia os cookies (credentials:include) e
    // renova a sessão automaticamente em caso de 401.
    const data = await apiClient.post<AgentQueryResponse>("/agents/query", { message });
    const fullText = data?.message || data?.response || data?.text || "";

    // Simula streaming character by character
    let currentText = "";
    for (const char of fullText) {
      currentText += char;
      onChunk?.(currentText);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    onComplete?.(fullText);
    return fullText;
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error("Erro desconhecido"));
    throw error;
  }
}
