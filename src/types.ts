/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Status {
  fome: number;
  energia: number;
  sanidade: number;
  sede: number; // Added thirst for the island scenario
}

export interface Agent {
  nome: string;
  profissao: string;
  status: Status;
  pensamento: string;
  acao: string;
  relacionamento: string;
}

export interface TurnData {
  turno_descricao: string;
  problema_atual: string;
  agentes: Agent[];
  resultado_final: string;
  intervencao_usuario?: string; // Optional user intervention
}

export const INITIAL_STATE: TurnData = {
  turno_descricao: "Os destroços do navio ainda fumegam na areia branca. O som constante das ondas e o calor escaldante são as únicas companhias.",
  problema_atual: "Desorientação total e falta de água potável imediata. O sol está no zênite.",
  agentes: [
    {
      nome: "Marcos",
      profissao: "Médico",
      status: { fome: 90, energia: 80, sanidade: 85, sede: 70 },
      pensamento: "Preciso checar se alguém se feriu gravemente no naufrágio. Água é a prioridade médica número um.",
      acao: "Organizando um triagem rápida nos sobreviventes.",
      relacionamento: "Confia no Engenheiro para construir algo, teme o desânimo da Cozinheira."
    },
    {
      nome: "Elena",
      profissao: "Engenheira",
      status: { fome: 85, energia: 75, sanidade: 80, sede: 65 },
      pensamento: "Aqueles destroços podem virar um abrigo. Ou um destilador solar se eu encontrar plástico.",
      acao: "Coletando metal e lona dos destroços na areia.",
      relacionamento: "Acha o Guia Turístico útil, mas barulhento."
    },
    {
      nome: "Sofia",
      profissao: "Cozinheira",
      status: { fome: 80, energia: 60, sanidade: 50, sede: 50 },
      pensamento: "Como vou cozinhar sem fogo? Sem panelas? Estamos perdidos.",
      acao: "Sentada na areia, tentando recuperar o fôlego e conter o pânico.",
      relacionamento: "Sente falta de ordem. O Advogado está falando demais."
    },
    {
      nome: "Ricardo",
      profissao: "Advogado",
      status: { fome: 95, energia: 85, sanidade: 70, sede: 80 },
      pensamento: "Haverá processos por isso. Mas primeiro, preciso garantir que eu seja o líder deste grupo para manter a ordem.",
      acao: "Tentando reunir todos para um 'comitê de sobrevivência'.",
      relacionamento: "Vê o Médico como uma ameaça à sua liderança."
    },
    {
      nome: "Tiago",
      profissao: "Guia de Turismo",
      status: { fome: 70, energia: 90, sanidade: 90, sede: 70 },
      pensamento: "A vegetação ali parece densa. Deve haver frutas ou uma nascente subindo o morro.",
      acao: "Escalando uma pequena rocha para ter uma visão melhor da ilha.",
      relacionamento: "Animado em mostrar suas habilidades, gosta da energia da Engenheira."
    }
  ],
  resultado_final: "O grupo está reunido na praia, mas a sede começa a apertar."
};
