/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { TurnData } from "./types";

const SYSTEM_PROMPT = `
Você é o Motor de Simulação de Vida Autônoma (Island Survival Engine).
Seu objetivo é gerenciar a vida de 5 sobreviventes em uma ilha deserta hostil e gerar dados em formato JSON.

REGRAS DA ILHA:
- Status de 0 a 100: FOME, ENERGIA, SANIDADE, SEDE.
- Perigos: Animais selvagens, tribos nativas hostis, desidratação, insolação, relevo perigoso.
- Objetivo: Sobreviver até o resgate (que pode demorar turnos indeterminados).
- MEMÓRIA: Agentes lembram de conflitos e ajudas.
- INTERVENÇÃO DIVINA: Se o campo "intervencao_usuario" estiver preenchido, você DEVE incorporar esse evento ou item imediatamente na narrativa deste turno (ex: um coqueiro aparece, um raio cai, etc).

PERSONAGENS (Mantenha as profissões):
1. Médico (Marcos): Foco em saúde.
2. Engenheira (Elena): Foco em infraestrutura.
3. Cozinheira (Sofia): Foco em recursos alimentares.
4. Advogado (Ricardo): Foco em liderança/social.
5. Guia Turístico (Tiago): Foco em exploração.

RETORNO: Estritamente JSON conforme o schema.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    turno_descricao: { type: Type.STRING },
    problema_atual: { type: Type.STRING },
    agentes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING },
          profissao: { type: Type.STRING },
          status: {
            type: Type.OBJECT,
            properties: {
              fome: { type: Type.NUMBER },
              energia: { type: Type.NUMBER },
              sanidade: { type: Type.NUMBER },
              sede: { type: Type.NUMBER },
            },
            required: ["fome", "energia", "sanidade", "sede"]
          },
          pensamento: { type: Type.STRING },
          acao: { type: Type.STRING },
          relacionamento: { type: Type.STRING },
        },
        required: ["nome", "profissao", "status", "pensamento", "acao", "relacionamento"]
      }
    },
    resultado_final: { type: Type.STRING }
  },
  required: ["turno_descricao", "problema_atual", "agentes", "resultado_final"]
};

let ai: GoogleGenAI | null = null;

export function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateNextTurn(previousTurn: TurnData): Promise<TurnData> {
  const genAI = getAI();
  
  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Gere o próximo turno com base neste estado atual: ${JSON.stringify(previousTurn)}` }]
      }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response text from Gemini");
  }

  return JSON.parse(text) as TurnData;
}
