import { OpenRouter } from "@openrouter/sdk";

// Initialize the OpenRouter client using the environment variable
const getOpenRouter = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set. Please add it in Settings > Secrets.");
    }
    return new OpenRouter({
        apiKey,
        // Optional: Add headers for identification
        fetch: (url, init) => {
            return fetch(url, {
                ...init,
                headers: {
                    ...init?.headers,
                    "HTTP-Referer": "https://ai.studio/build",
                    "X-Title": "ShoeStock Label Extractor"
                }
            });
        }
    });
};

export async function extractShoeLabel(base64Image: string) {
    const openrouter = getOpenRouter();
    
    // Ensure base64 string has the correct data URI prefix
    const dataUri = base64Image.startsWith('data:') 
        ? base64Image 
        : `data:image/jpeg;base64,${base64Image}`;

    try {
        // Switching to a model that is FREE and has VISION capabilities.
        // Llama 3.3 is text-only; we need Gemini or Pixtral for images.
        const response = await openrouter.chat.completions.create({
            model: "google/gemini-2.0-flash-lite-preview-02-05:free",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: 'Extract shoe label details into JSON. MANDATORY: UK size (find it next to UK or U.K.). Format your entire response as a single valid JSON object with these keys: {"shoeName": "...", "brand": "...", "euSize": "...", "usSize": "...", "ukSize": "...", "color": "...", "sku": "...", "quantity": "..."}. Do not include markdown code blocks, just the JSON.'
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: dataUri
                            }
                        }
                    ]
                }
            ],
            // Some free models don't support response_format: json_object strictly, 
            // so we will rely on a clean prompt and manual cleaning if needed.
        });

        if (!response.choices || response.choices.length === 0) {
            throw new Error("OpenRouter returned no results.");
        }

        let content = response.choices[0].message.content;
        console.log("OpenRouter Response content:", content);
        
        if (!content) {
            throw new Error("AI returned empty content.");
        }

        // Clean content in case the model ignored directions and added ```json blocks
        const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleaned);
    } catch (error: any) {
        console.error("Extraction error:", error);
        
        // Handle the "credits" error or other common OpenRouter issues
        const apiError = error.response?.data?.error?.message || error.message;
        if (apiError.includes("purchased credits")) {
            throw new Error("OpenRouter error: Even for free models, some providers require a verified account or a $5 minimum balance. Try checking your OpenRouter credits.");
        }
        
        throw new Error(apiError || "An unexpected error occurred during label extraction.");
    }
}
