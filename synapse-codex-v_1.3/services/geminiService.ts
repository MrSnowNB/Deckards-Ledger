


import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ProcessDocumentResponse, MiniFile, Status, DependencyStatus, InitialMiniFile, GeminiApiResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        projectSummary: {
            type: Type.STRING,
            description: "A concise, one-paragraph summary of the entire document's purpose and content.",
        },
        miniFiles: {
            type: Type.ARRAY,
            description: "An array of chunked mini-file objects from the document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: {
                        type: Type.STRING,
                        description: "A short, descriptive, URL-friendly slug with a numeric prefix (e.g., '001-introduction').",
                    },
                    agentHint: {
                        type: Type.STRING,
                        description: "A brief, actionable instruction for an agent processing this chunk (e.g., 'Review for clarity and add a code example.').",
                    },
                    tokens: {
                        type: Type.INTEGER,
                        description: "An estimated token count for the content of this chunk.",
                    },
                    content: {
                        type: Type.STRING,
                        description: "The full text content of this chunk, wrapped with the specified navigation links.",
                    },
                    modalities: {
                        type: Type.ARRAY,
                        description: "An array of modalities present in the content. Use 'text' for paragraphs, 'code' for fenced code blocks, 'image' for markdown images, and 'table' for markdown tables.",
                        items: {
                            type: Type.STRING,
                            enum: ['text', 'code', 'image', 'table'],
                        }
                    },
                },
                required: ["id", "agentHint", "tokens", "content", "modalities"],
            },
        },
    },
    required: ["projectSummary", "miniFiles"],
};

const getPrompt = (text: string): string => `
Please process the following document.

Rules:
1. Split the document into contiguous blocks. Each block should be a logical segment of the document.
2. Preserve section boundaries (like markdown headings) where possible. A chunk should not end in the middle of a sentence or paragraph.
3. Generate a concise, one-paragraph \`projectSummary\` for the entire document.
4. For each chunk, create a \`miniFile\` object. You MUST provide all the required properties as defined in the schema.
5. For each chunk, identify the types of content present and list them in the \`modalities\` array. Possible values are 'text', 'code' (for fenced code blocks), 'image' (for markdown images like \`![alt](src)\`), and 'table' (for markdown tables). If no other modalities are present, use ['text'].
6. IMPORTANT: For the \`content\` of each miniFile, you MUST wrap it with navigation links. The mini-files are saved in a 'docs/mini' subdirectory, so the relative path to the root protocol file is important. The content must start with the line "[⬅️ Return to the Hiro Protocol](../../000-hiro_protocol.md)" followed by "---" on a new line. The content must end with "---" on a new line, followed by the line "[⬅️ Return to the Hiro Protocol](../../000-hiro_protocol.md)".

Example format for the 'content' field:
[⬅️ Return to the Hiro Protocol](../../000-hiro_protocol.md)
---
... a chunk of the original document goes here ...
---
[⬅️ Return to the Hiro Protocol](../../000-hiro_protocol.md)

Document to process:
---
${text}
---
`;


export const runGeminiAgent = async (text: string): Promise<ProcessDocumentResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: getPrompt(text),
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });
        
        const jsonResponse: GeminiApiResponse = JSON.parse(response.text);

        const now = new Date().toISOString();
        const fullMiniFiles: MiniFile[] = jsonResponse.miniFiles.map((mf: InitialMiniFile) => ({
            ...mf,
            parentId: 'root',
            hash: uuidv4().substring(0, 8),
            version: 1,
            created: now,
            status: Status.InProgress,
            dependencies: [],
            modalities: mf.modalities && mf.modalities.length > 0 ? mf.modalities : ['text'],
            dependencyStatus: DependencyStatus.UpToDate,
            provenance: null,
            verificationTrail: [],
            validationErrors: null,
        }));

        return {
            projectSummary: jsonResponse.projectSummary,
            miniFiles: fullMiniFiles,
        };

    } catch (error) {
        console.error("Error processing document with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to process document: ${error.message}`);
        }
        throw new Error("An unknown error occurred while processing the document.");
    }
};