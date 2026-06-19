import { apiBaseUrl, tryRefreshSession } from "@/lib/api-client";

export interface StreamChatOptions {
  message: string;
  files?: File[];
  signal?: AbortSignal;
  onChunk?: (fullText: string) => void;
  onAgent?: (agent: string) => void;
  onStep?: (name: string) => void;
  onConversation?: (conversationId: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface SseEvent {
  type: "conversation" | "handoff" | "step" | "token" | "done" | "error";
  content?: string;
  agent?: string;
  conversation_id?: string;
}

export async function streamChat(options: StreamChatOptions): Promise<string> {
  const {
    message,
    files = [],
    signal,
    onChunk,
    onAgent,
    onStep,
    onConversation,
    onComplete,
    onError,
  } = options;

  // O thread do chat é derivado do usuário logado no backend (pelo token), não
  // é mais escolhido pelo cliente — por isso não enviamos conversation_id.
  const buildForm = (): FormData => {
    const form = new FormData();
    form.append("message", message);
    for (const file of files) form.append("files", file, file.name);
    return form;
  };

  const send = (): Promise<Response> =>
    fetch(`${apiBaseUrl}/chat/messages`, {
      method: "POST",
      credentials: "include",
      body: buildForm(),
      signal,
    });

  try {
    let response: Response;
    try {
      response = await send();
    } catch {
      throw new Error("Não foi possível conectar ao servidor.");
    }

    if (response.status === 401 && (await tryRefreshSession())) {
      response = await send();
    }

    if (!response.ok || !response.body) {
      throw new Error(`Falha ao iniciar o chat (${response.status}).`);
    }

    const fullText = await consumeStream(response.body, {
      onChunk,
      onAgent,
      onStep,
      onConversation,
    });

    onComplete?.(fullText);
    return fullText;
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error("Erro desconhecido");
    onError?.(normalized);
    throw normalized;
  }
}

async function consumeStream(
  body: ReadableStream<Uint8Array>,
  handlers: Pick<StreamChatOptions, "onChunk" | "onAgent" | "onStep" | "onConversation">,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let separator = buffer.indexOf("\n\n");
    while (separator !== -1) {
      const rawEvent = buffer.slice(0, separator);
      buffer = buffer.slice(separator + 2);
      separator = buffer.indexOf("\n\n");

      const event = parseEvent(rawEvent);
      if (!event) continue;

      if (event.type === "conversation" && event.conversation_id) {
        handlers.onConversation?.(event.conversation_id);
      } else if (event.type === "handoff") {
        if (event.agent) handlers.onAgent?.(event.agent);
      } else if (event.type === "step") {
        if (event.content) handlers.onStep?.(event.content);
      } else if (event.type === "token") {
        fullText = event.content ?? "";
        handlers.onChunk?.(fullText);
      } else if (event.type === "done") {
        if (event.content) {
          fullText = event.content;
          handlers.onChunk?.(fullText);
        }
      } else if (event.type === "error") {
        throw new Error(event.content || "Erro ao processar a mensagem.");
      }
    }
  }

  return fullText;
}

function parseEvent(rawEvent: string): SseEvent | null {
  const data = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).replace(/^ /, ""))
    .join("");
  if (!data) return null;
  try {
    return JSON.parse(data) as SseEvent;
  } catch {
    return null;
  }
}
