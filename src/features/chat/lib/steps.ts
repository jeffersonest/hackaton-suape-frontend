const STEP_LABELS: Record<string, string> = {
  extract_license_from_pdf: "Lendo o PDF e extraindo as exigências",
  register_extracted_license: "Cadastrando a licença e classificando os prazos",
  query_license: "Consultando o acervo de licenças",
  list_licenses: "Buscando as licenças cadastradas",
  list_license_requirements: "Buscando as exigências",
  attach_file: "Anexando o arquivo",
  remove_attachment: "Removendo o anexo",
  list_attachments: "Listando os anexos",
  answering: "Preparando a resposta",
};

export function stepLabel(name: string): string {
  return STEP_LABELS[name] ?? "Processando";
}
