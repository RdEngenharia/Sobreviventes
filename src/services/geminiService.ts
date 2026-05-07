/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { TurnData } from "../types";

const SYSTEM_PROMPT = `
Você é o Motor de Simulação de Vida Autônoma (Island Survival Engine).
Seu objetivo é gerenciar a vida de 5 sobreviventes em uma ilha deserta hostil e gerar dados em formato JSON.

REGRAS DA ILHA:
- Status de 0 a 100: FOME, ENERGIA, SANIDADE, SEDE. (0 = Morte/Incapacitado)
- Perigos: Animais selvagens, tribos nativas hostis, desidratação, insolação, relevo perigoso.
- Objetivo: Sobreviver até o resgate.
- MEMÓRIA: Agentes lembram de conflitos e ajudas.
- INTERVENÇÃO USUÁRIO: Se o campo "intervencao_usuario" no estado anterior tiver conteúdo, incorpore-o IMEDIATAMENTE (ex: 'Um coqueiro aparece').

PERSONAGENS:
1. Marcos (Médico)
2. Elena (Engenheira)
3. Sofia (Cozinheira)
4. Ricardo (Advogado)
5. Tiago (Guia Turístico)
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

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada. Por favor, adicione sua chave nas configurações de Secrets do AI Studio.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateNextTurn(previousTurn: TurnData): Promise<TurnData> {
  const client = getAI();
  
  const response = await client.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { 
        role: "user", 
        parts: [{ text: `Gere o próximo turno da simulação de sobrevivência na ilha com base no estado anterior: ${JSON.stringify(previousTurn)}` }] 
      }
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 1.0,
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("O modelo não retornou uma resposta válida.");
  }

  try {
    return JSON.parse(text) as TurnData;
  } catch (e) {
    console.error("Erro ao processar JSON da IA:", text);
    throw new Error("Falha na interpretação dos dados recebidos da ilha.");
  }
}
