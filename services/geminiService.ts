import { GoogleGenAI, Type } from "@google/genai";
import { NodeType, NODE_COLORS } from "../types";

// Helper to get a random color
const getRandomColor = () => {
  const colors = Object.values(NODE_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateNextSteps = async (
  currentStepText: string,
  context: string
): Promise<{ text: string; type: NodeType; color: string }[]> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return [
      { text: "Next Step A", type: NodeType.PROCESS, color: NODE_COLORS.PROCESS_BLUE },
      { text: "Decision B", type: NodeType.DECISION, color: NODE_COLORS.DECISION_ORANGE },
    ];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given the flowchart node "${currentStepText}" in the context of "${context}", suggest 3 logical next nodes. 
      Return a JSON array where each object has 'text' (short label), 'type' (must be one of: PROCESS, DECISION, PREPARATION, START_END), and a reason.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              type: { type: Type.STRING },
            },
            required: ["text", "type"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    
    // Map the string types back to our Enum and assign colors
    return result.map((item: any) => {
      let mappedType = NodeType.PROCESS;
      let color = NODE_COLORS.PROCESS_BLUE;

      const upperType = item.type?.toUpperCase();
      
      if (upperType === 'DECISION') {
        mappedType = NodeType.DECISION;
        color = NODE_COLORS.DECISION_ORANGE; // Decisions usually yellow/orange
      } else if (upperType === 'PREPARATION') {
        mappedType = NodeType.PREPARATION;
        color = NODE_COLORS.PREP_YELLOW;
      } else if (upperType === 'START_END') {
        mappedType = NodeType.START_END;
        color = NODE_COLORS.START_GREEN;
      }

      return {
        text: item.text,
        type: mappedType,
        color: color
      };
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
     return [
      { text: "Error fetching AI", type: NodeType.PROCESS, color: NODE_COLORS.TERMINAL_RED },
    ];
  }
};