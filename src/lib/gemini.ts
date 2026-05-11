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
        // We use the requested free model, but note that it might have limited vision support.
        // If it fails to see the image, we may need to use a vision-specific free model like llama-3.2-11b-vision-instruct:free
        const response = await openrouter.chat.completions.create({
            model: "meta-llama/llama-3.3-70b-instruct:free",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: 'Extract shoe label details into JSON. MANDATORY: UK size (find it next to UK or U.K.). Format: {"shoeName": "...", "brand": "...", "euSize": "...", "usSize": "...", "ukSize": "...", "color": "...", "sku": "...", "quantity": "..."}. If the model cannot "see" the image, return empty values for fields but maintain JSON structure.'
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
            response_format: { type: 'json_object' }
        });

        if (!response.choices || response.choices.length === 0) {
            throw new Error("OpenRouter returned no results.");
        }

        const content = response.choices[0].message.content;
        console.log("OpenRouter Response content:", content);
        
        if (!content) {
            throw new Error("AI returned empty content.");
        }

        return JSON.parse(content);
    } catch (error: any) {
        console.error("Extraction error:", error);
        
        // Handle specific API errors
        if (error.status === 401 || error.status === 403) {
            throw new Error("Unauthorized: Your OpenRouter API Key is invalid.");
        }
        
        const errorMessage = error.message || "An unexpected error occurred during label extraction.";
        throw new Error(errorMessage);
    }
}
