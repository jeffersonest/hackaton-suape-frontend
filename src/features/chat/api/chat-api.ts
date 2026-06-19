import { apiBaseUrl, tryRefreshSession } from "@/lib/api-client";

export interface StreamChatOptions {
  message: string;
  /** Arquivos a enviar junto (PDF de licença, imagens a anexar, etc.). */
  files?: File[];
  /** Conversa existente para manter o histórico no backend. */
  conversationId?: string | null;
  signal?: AbortSignal;
  /** Recebe o texto ACUMULADO da resposta a cada token. */
  onChunk?: (fullText: string) => void;
  /** Nome do agente especialista ativo (handoff do supervisor). */
  onAgent?: (agent: string) => void;
  /** Id da conversa resolvido pelo backend (primeiro evento). */
  onConversation?: (conversationId: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface SseEvent {
  type: "conversation" | "handoff" | "token" | "done" | "error";
  content?: string;
  agent?: string;
  conversation_id?: string;
}

/**
 * Conversa com o agente via SSE real (`POST /chat/messages`, multipart). Lê o
 * corpo como stream, separa eventos por `\n\n`, e despacha cada `data: {json}`.
 * Em 401 renova a sessão uma vez (mesmo refresh single-flight do api-client) e
 * refaz a requisição. Retorna o texto final completo.
 */
export async function streamChat(options: StreamChatOptions): Promise<string> {
  const {
    message,
    files = [],
    conversationId,
    signal,
    onChunk,
    onAgent,
    onConversation,
    onComplete,
    onError,
  } = options;

  const buildForm = (): FormData => {
    const form = new FormData();
    form.append("message", message);
    if (conversationId) form.append("conversation_id", conversationId);
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
  handlers: Pick<StreamChatOptions, "onChunk" | "onAgent" | "onConversation">,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
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
        // Novo especialista assume: zera o acumulado para a próxima fala
        // substituir a anterior (evita concatenar respostas de agentes distintos).
        if (event.agent) handlers.onAgent?.(event.agent);
        fullText = "";
      } else if (event.type === "token") {
        fullText += event.content ?? "";
        handlers.onChunk?.(fullText);
      } else if (event.type === "done") {
        // O backend manda a resposta final consolidada — fonte da verdade.
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

/** Extrai o JSON de um bloco SSE (linhas `data:` concatenadas). */
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
