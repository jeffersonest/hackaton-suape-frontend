export interface StreamChatOptions {
  message: string;
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export async function streamChat({
  message,
  onChunk,
  onComplete,
  onError,
}: StreamChatOptions): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${apiUrl}/agents/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const fullText = data.message || data.response || data.text || "";

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
