import { GoogleGenAI, Type } from "@google/genai";
import { Gender, Voter } from "../types";
// @ts-ignore
import { read, utils } from "xlsx";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSampleVoters = async (count: number = 10): Promise<Voter[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a realistic list of ${count} eligible voters for a polling booth. 
      Include a mix of genders. 
      The 'pollBoothNumber' should be consistent for small groups (e.g., 'PB-101', 'PB-102').
      'voterId' should be alphanumeric format (e.g., ABC1234567).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              gender: { type: Type.STRING, enum: ["Male", "Female", "Other"] },
              pollBoothNumber: { type: Type.STRING },
              voterId: { type: Type.STRING },
            },
            required: ["name", "gender", "pollBoothNumber", "voterId"],
          },
        },
      },
    });

    const rawData = JSON.parse(response.text || "[]");

    // Transform and add client-side properties
    return rawData.map((item: any) => ({
      id: crypto.randomUUID(),
      name: item.name,
      gender: item.gender as Gender,
      pollBoothNumber: item.pollBoothNumber,
      voterId: item.voterId,
      hasVoted: false,
      // Random deterministic avatar based on gender/id logic would be better, but random is fine for mock
      avatarUrl: `https://picsum.photos/seed/${item.voterId}/64/64`, 
    }));
  } catch (error) {
    console.error("Failed to generate sample voters:", error);
    return [];
  }
};

export const processVoterFile = async (file: File): Promise<Voter[]> => {
  try {
    let contentPart: any = {};
    let promptText = "";

    // Handle different file types
    if (file.type === "application/pdf") {
      const base64Data = await fileToBase64(file);
      contentPart = {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      };
      promptText = "Analyze this PDF document and extract the list of voters. Return a JSON array. Look for Name, Gender, Voter ID, and Poll Booth Number. If Poll Booth is not found, use 'Unknown'.";
    } 
    else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
      const csvText = await readExcelOrCsv(file);
      contentPart = {
        text: csvText
      };
      promptText = "Analyze this CSV/Table data and extract the list of voters. Return a JSON array. Map columns to Name, Gender, Voter ID, and Poll Booth Number.";
    } 
    else {
      throw new Error("Unsupported file format. Please upload PDF or Excel.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { text: promptText },
        contentPart
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              gender: { type: Type.STRING, enum: ["Male", "Female", "Other"] },
              pollBoothNumber: { type: Type.STRING },
              voterId: { type: Type.STRING },
            },
            required: ["name", "gender", "pollBoothNumber", "voterId"],
          },
        },
      },
    });

    const rawData = JSON.parse(response.text || "[]");

    return rawData.map((item: any) => ({
      id: crypto.randomUUID(),
      name: item.name,
      gender: (["Male", "Female"].includes(item.gender) ? item.gender : "Other") as Gender,
      pollBoothNumber: item.pollBoothNumber || "PB-UNKNOWN",
      voterId: item.voterId || "UNKNOWN",
      hasVoted: false,
      avatarUrl: `https://picsum.photos/seed/${item.voterId || Math.random()}/64/64`,
    }));

  } catch (error) {
    console.error("Error processing file:", error);
    throw error;
  }
};

// Helper to convert File to Base64 (stripping the data URL prefix)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:application/pdf;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to read Excel/CSV using xlsx library
const readExcelOrCsv = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = read(arrayBuffer);
  // Read the first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // Convert to CSV text
  return utils.sheet_to_csv(worksheet);
};