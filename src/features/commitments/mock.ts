export interface ReplantingPoint {
  lat: number;
  lon: number;
}

export interface Commitment {
  id: string;
  numero: string;
  orgao: string;
  compromissado: string;
  cnpj: string;
  representante: string;
  processos: string;
  licenca: string;
  objeto: string;
  status: "Em execução" | "Vigente" | "Concluído";
  assinado_em: string;
  inicio_plantio: string;
  monitoramento_meses: number;
  mudas: number;
  bioma: string;
  clausula4_titulo: string;
  clausula4_texto: string;
  clausula7_titulo: string;
  clausula7_texto: string;
  multa: number;
  replantio_lat: number;
  replantio_lon: number;
  replantio_vertices: ReplantingPoint[];
}

export function earthUrl(lat: number, lon: number): string {
  return `https://earth.google.com/web/@${lat},${lon},400a,300d`;
}

export function mapsEmbed(lat: number, lon: number): string {
  return `https://maps.google.com/maps?q=${lat},${lon}&z=17&output=embed`;
}

export function mapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

export const COMMITMENTS: Commitment[] = [
  {
    id: "146-2025",
    numero: "146/2025",
    orgao: "CPRH — Agência Estadual de Meio Ambiente",
    compromissado: "SUAPE — Complexo Industrial Portuário Governador Eraldo Gueiros",
    cnpj: "11.448.933/0001-62",
    representante: "Carlos André Vanderlei de Vasconcelos Cavalcanti (Diretor de Sustentabilidade)",
    processos: "03330/2022 e 07714/2023",
    licenca: "LO 05.21.09.003636-1",
    objeto:
      "Compensação florestal — plantio de 270 mudas nativas do Bioma Mata Atlântica (espaçamento 3m × 2m) na Zona de Preservação Ecológica de SUAPE (ZPEC), em compensação à supressão de 27 indivíduos nativos.",
    status: "Em execução",
    assinado_em: "2025-08-15",
    inicio_plantio: "2026-03",
    monitoramento_meses: 36,
    mudas: 270,
    bioma: "Mata Atlântica",
    clausula4_titulo: "Cláusula Quarta — Da Área de Compensação",
    clausula4_texto:
      "A compensação florestal se dará pelo plantio de 270 mudas nativas do Bioma Mata Atlântica, espaçamento 3m × 2m, na Zona de Preservação Ecológica de SUAPE (ZPEC), municípios de Ipojuca e Cabo de Santo Agostinho-PE. A execução seguirá o Programa de Compensação Ambiental aprovado pelo Parecer PGQA nº 000548/2024 (processo 07714/2023), realizada nas coordenadas dos vértices indicados.",
    clausula7_titulo: "Cláusula Sétima — Da Responsabilidade e Penalidade",
    clausula7_texto:
      "Na hipótese de descumprimento total ou parcial do presente Termo, fica estipulada multa no valor de R$ 5.000,00, sem prejuízo da obrigação de fazer e das penalidades previstas na Lei Estadual nº 14.249/10 (arts. 40 e seguintes), no Decreto Federal nº 6.514/2008 (art. 83), na IN CPRH nº 007/2006 e na IN MMA nº 006/2006.",
    multa: 5000,
    replantio_lat: -8.297052,
    replantio_lon: -34.997353,
    replantio_vertices: [
      { lat: -8.296697, lon: -34.997402 },
      { lat: -8.296803, lon: -34.997321 },
      { lat: -8.297144, lon: -34.997019 },
      { lat: -8.297338, lon: -34.99744 },
      { lat: -8.297209, lon: -34.997539 },
      { lat: -8.29712, lon: -34.997396 },
    ],
  },
  {
    id: "132-2024",
    numero: "132/2024",
    orgao: "CPRH — Agência Estadual de Meio Ambiente",
    compromissado: "SUAPE — Complexo Industrial Portuário Governador Eraldo Gueiros",
    cnpj: "11.448.933/0001-62",
    representante: "Marina Lopes de Albuquerque (Gerente de Gestão Ambiental)",
    processos: "02210/2021",
    licenca: "LO 05.19.06.001122-3",
    objeto:
      "Compensação florestal — plantio de 150 mudas nativas do Bioma Mata Atlântica na Zona de Preservação Ecológica de SUAPE (ZPEC), em compensação à supressão de vegetação para obras de infraestrutura.",
    status: "Concluído",
    assinado_em: "2024-05-20",
    inicio_plantio: "2024-09",
    monitoramento_meses: 24,
    mudas: 150,
    bioma: "Mata Atlântica",
    clausula4_titulo: "Cláusula Quarta — Da Área de Compensação",
    clausula4_texto:
      "A compensação florestal se dará pelo plantio de 150 mudas nativas do Bioma Mata Atlântica, espaçamento 3m × 2m, na Zona de Preservação Ecológica de SUAPE (ZPEC), município de Cabo de Santo Agostinho-PE, conforme programa aprovado pela CPRH.",
    clausula7_titulo: "Cláusula Sétima — Da Responsabilidade e Penalidade",
    clausula7_texto:
      "Na hipótese de descumprimento total ou parcial do presente Termo, fica estipulada multa no valor de R$ 3.000,00, sem prejuízo da obrigação de fazer e das demais penalidades legais aplicáveis.",
    multa: 3000,
    replantio_lat: -8.365,
    replantio_lon: -34.958,
    replantio_vertices: [
      { lat: -8.36478, lon: -34.95822 },
      { lat: -8.36512, lon: -34.95788 },
      { lat: -8.36531, lon: -34.95815 },
    ],
  },
  {
    id: "158-2025",
    numero: "158/2025",
    orgao: "CPRH — Agência Estadual de Meio Ambiente",
    compromissado: "SUAPE — Complexo Industrial Portuário Governador Eraldo Gueiros",
    cnpj: "11.448.933/0001-62",
    representante: "Carlos André Vanderlei de Vasconcelos Cavalcanti (Diretor de Sustentabilidade)",
    processos: "04412/2023",
    licenca: "AA 05.22.01.004821-7",
    objeto:
      "Compensação florestal — plantio de 320 mudas nativas do Bioma Mata Atlântica na Zona de Preservação Ecológica de SUAPE (ZPEC), em compensação à supressão vinculada à autorização ambiental.",
    status: "Vigente",
    assinado_em: "2025-11-03",
    inicio_plantio: "2026-06",
    monitoramento_meses: 36,
    mudas: 320,
    bioma: "Mata Atlântica",
    clausula4_titulo: "Cláusula Quarta — Da Área de Compensação",
    clausula4_texto:
      "A compensação florestal se dará pelo plantio de 320 mudas nativas do Bioma Mata Atlântica, espaçamento 3m × 2m, na Zona de Preservação Ecológica de SUAPE (ZPEC), município de Ipojuca-PE, nas coordenadas dos vértices indicados.",
    clausula7_titulo: "Cláusula Sétima — Da Responsabilidade e Penalidade",
    clausula7_texto:
      "Na hipótese de descumprimento total ou parcial do presente Termo, fica estipulada multa no valor de R$ 8.000,00, sem prejuízo da obrigação de fazer e das penalidades previstas na legislação ambiental vigente.",
    multa: 8000,
    replantio_lat: -8.41,
    replantio_lon: -35.005,
    replantio_vertices: [
      { lat: -8.40978, lon: -35.00522 },
      { lat: -8.41012, lon: -35.00489 },
      { lat: -8.41031, lon: -35.00518 },
      { lat: -8.40995, lon: -35.00541 },
    ],
  },
];
