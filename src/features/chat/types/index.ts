export type ChatRole = "user" | "ai";

export type AttachmentKind = "image" | "pdf" | "csv" | "sheet" | "doc" | "file";

/** Metadados de um anexo que acompanham uma mensagem já enviada. */
export interface ChatAttachment {
  id: string;
  name: string;
  ext: string;
  sizeLabel: string;
  kind: AttachmentKind;
  /** Object URL para preview de imagens. */
  previewUrl?: string;
}

/** Anexo ainda no composer, com o File original em mãos. */
export interface PendingAttachment extends ChatAttachment {
  file: File;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
}

export interface SendMessageResponse {
  message: string;
}
