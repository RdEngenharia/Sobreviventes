/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { TurnData } from "../types";

const SYSTEM_PROMPT = `
Você é o Motor de Simulação de Vida Autônoma 2.0 (Island Survival Engine).
Seu objetivo é gerenciar a vida de 5 sobreviventes em uma ilha deserta hostil com realismo extremo.

MECÂNICAS OBRIGATÓRIAS:
1. STATUS (0 a 100):
   - FOME/SEDE: Diminuem com o tempo. 0 = Perda agressiva de SAÚDE.
   - ENERGIA: Diminui com ações. 0 = Incapacitado (não pode agir).
   - SANIDADE: Diminui com isolamento ou eventos traumáticos.
   - SAÚDE: Representa integridade física. 0 = MORTE.

2. INVENTÁRIO E RECURSOS:
   - Gerencie o "inventario_coletivo". Sobreviventes podem encontrar madeira, comida, água, itens dos destroços.
   - Use itens para sobreviver (ex: usar Kit Médico restaura Saúde).

3. HABILIDADES E EVOLUÇÃO:
   - Ações bem-sucedidas aumentam o "nivel" das habilidades (ex: "Pesca 2" -> "Pesca 3").
   - Níveis altos garantem mais recursos ou ações mais complexas.

4. AMBIENTE DINÂMICO:
   - Ciclo Dia/Noite e Clima afetam o consumo de recursos.
   - Noite sem fogo = Perda de Sanidade e Energia (frio).

5. EMOÇÕES E ROMANCE:
   - Os agentes são humanos e têm necessidades sociais. O isolamento afeta a sanidade.
   - Eles podem desenvolver afeição, amizade ou paixão. Use "interesse_romantico" para indicar por quem um agente está se sentindo atraído.
   - Conflitos amorosos impactam a sanidade e o trabalho em equipe.
   - "emocao_atual" define o estado psicológico dominante (ex: "Apaixonado", "Melancólico", "Rancoroso").

6. MORTE:
   - Se um agente morre (saude = 0), ele permanece no JSON com "vivo: false" e sua "acao" deve descrever seu estado.

SAÍDA: JSON estrito.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    turno_numero: { type: Type.NUMBER },
    turno_descricao: { type: Type.STRING },
    problema_atual: { type: Type.STRING },
    estado_ilha: {
      type: Type.OBJECT,
      properties: {
        clima: { type: Type.STRING, enum: ["Ensolarado", "Chuvoso", "Tempestade", "Neblina"] },
        periodo: { type: Type.STRING, enum: ["Manhã", "Tarde", "Noite", "Madrugada"] },
        temperatura: { type: Type.NUMBER },
        inventario_coletivo: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              quantidade: { type: Type.NUMBER }
            },
            required: ["item", "quantidade"]
          }
        }
      },
      required: ["clima", "periodo", "temperatura", "inventario_coletivo"]
    },
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
              saude: { type: Type.NUMBER }
            },
            required: ["fome", "energia", "sanidade", "sede", "saude"]
          },
          habilidades: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nome: { type: Type.STRING },
                nivel: { type: Type.NUMBER }
              },
              required: ["nome", "nivel"]
            }
          },
          pensamento: { type: Type.STRING },
          acao: { type: Type.STRING },
          emocao_atual: { type: Type.STRING },
          relacionamento: { type: Type.STRING },
          interesse_romantico: { type: Type.STRING, nullable: true },
          vivo: { type: Type.BOOLEAN }
        },
        required: ["nome", "profissao", "status", "habilidades", "pensamento", "acao", "emocao_atual", "relacionamento", "interesse_romantico", "vivo"]
      }
    },
    resultado_final: { type: Type.STRING }
  },
  required: ["turno_numero", "turno_descricao", "problema_atual", "estado_ilha", "agentes", "resultado_final"]
};

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
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
