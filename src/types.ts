/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Status {
  fome: number;
  energia: number;
  sanidade: number;
  sede: number;
  saude: number; // Força física/integridade
}

export interface Skill {
  nome: string;
  nivel: number; // 0-10
}

export interface InventoryItem {
  item: string;
  quantidade: number;
}

export interface Agent {
  nome: string;
  profissao: string;
  status: Status;
  habilidades: Skill[];
  pensamento: string;
  acao: string;
  emocao_atual: string;
  relacionamento: string;
  interesse_romantico: string | null;
  vivo: boolean;
}

export interface IslandState {
  clima: "Ensolarado" | "Chuvoso" | "Tempestade" | "Neblina";
  periodo: "Manhã" | "Tarde" | "Noite" | "Madrugada";
  temperatura: number;
  inventario_coletivo: InventoryItem[];
}

export interface TurnData {
  turno_numero: number;
  turno_descricao: string;
  problema_atual: string;
  estado_ilha: IslandState;
  agentes: Agent[];
  resultado_final: string;
  intervencao_usuario?: string;
}

export const INITIAL_STATE: TurnData = {
  turno_numero: 1,
  turno_descricao: "Os destroços do navio ainda fumegam na areia branca. O som constante das ondas e o calor escaldante são as únicas companhias.",
  problema_atual: "Desorientação total e falta de água potável imediata.",
  estado_ilha: {
    clima: "Ensolarado",
    periodo: "Manhã",
    temperatura: 32,
    inventario_coletivo: [
      { item: "Kit Médico Básico", quantidade: 1 },
      { item: "Lona Plástica", quantidade: 2 }
    ]
  },
  agentes: [
    {
      nome: "Marcos",
      profissao: "Médico",
      status: { fome: 90, energia: 80, sanidade: 85, sede: 70, saude: 100 },
      habilidades: [{ nome: "Medicina", nivel: 5 }, { nome: "Coleta", nivel: 1 }],
      pensamento: "Preciso checar se alguém se feriu gravemente no naufrágio. Água é a prioridade médica número um.",
      acao: "Organizando um triagem rápida nos sobreviventes.",
      emocao_atual: "Preocupado",
      relacionamento: "Confia no Engenheiro para construir algo, teme o desânimo da Cozinheira.",
      interesse_romantico: null,
      vivo: true
    },
    {
      nome: "Elena",
      profissao: "Engenheira",
      status: { fome: 85, energia: 75, sanidade: 80, sede: 65, saude: 100 },
      habilidades: [{ nome: "Construção", nivel: 5 }, { nome: "Eletrônica", nivel: 3 }],
      pensamento: "Aqueles destroços podem virar um abrigo. Ou um destilador solar se eu encontrar plástico.",
      acao: "Coletando metal e lona dos destroços na areia.",
      emocao_atual: "Focada",
      relacionamento: "Acha o Guia Turístico útil, mas barulhento.",
      interesse_romantico: null,
      vivo: true
    },
    {
      nome: "Sofia",
      profissao: "Cozinheira",
      status: { fome: 80, energia: 60, sanidade: 50, sede: 50, saude: 100 },
      habilidades: [{ nome: "Culinária", nivel: 5 }, { nome: "Botânica", nivel: 2 }],
      pensamento: "Como vou cozinhar sem fogo? Sem panelas? Estamos perdidos.",
      acao: "Sentada na areia, tentando recuperar o fôlego e conter o pânico.",
      emocao_atual: "Aterrorizada",
      relacionamento: "Sente falta de ordem. O Advogado está falando demais.",
      interesse_romantico: null,
      vivo: true
    },
    {
      nome: "Ricardo",
      profissao: "Advogado",
      status: { fome: 95, energia: 85, sanidade: 70, sede: 80, saude: 100 },
      habilidades: [{ nome: "Diplomacia", nivel: 5 }, { nome: "Liderança", nivel: 4 }],
      pensamento: "Haverá processos por isso. Mas primeiro, preciso garantir que eu seja o líder deste grupo para manter a ordem.",
      acao: "Tentando reunir todos para um 'comitê de sobrevivência'.",
      emocao_atual: "Calculista",
      relacionamento: "Vê o Médico como uma ameaça à sua liderança.",
      interesse_romantico: null,
      vivo: true
    },
    {
      nome: "Tiago",
      profissao: "Guia de Turismo",
      status: { fome: 70, energia: 90, sanidade: 90, sede: 70, saude: 100 },
      habilidades: [{ nome: "Exploração", nivel: 5 }, { nome: "Caça", nivel: 3 }],
      pensamento: "A vegetação ali parece densa. Deve haver frutas ou uma nascente subindo o morro.",
      acao: "Escalando uma pequena rocha para ter uma visão melhor da ilha.",
      emocao_atual: "Adrenalina",
      relacionamento: "Animado em mostrar suas habilidades, gosta da energia da Engenheira.",
      interesse_romantico: "Elena",
      vivo: true
    }
  ],
  resultado_final: "O grupo está reunido na praia, mas a sede começa a apertar."
};
