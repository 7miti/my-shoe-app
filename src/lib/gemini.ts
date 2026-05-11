import axios from 'axios';

export async function extractShoeLabel(base64Image: string) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not set. Please add it in Settings > Secrets.");
    }

    // Ensure base64 string has the correct data URI prefix for the API
    const dataUri = base64Image.startsWith('data:') 
        ? base64Image 
        : `data:image/jpeg;base64,${base64Image}`;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'google/gemini-2.0-flash-001',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Extract shoe label details into JSON. MANDATORY: UK size (find it next to UK or U.K.). Format: {"shoeName": "...", "brand": "...", "euSize": "...", "usSize": "...", "ukSize": "...", "color": "...", "sku": "...", "quantity": "..."}. Ensure UK size is not empty if it exists on the label.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: dataUri
                            }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' }
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://ai.studio/build',
                'X-Title': 'Stockdiscrepancy'
            },
            timeout: 30000 // 30 second timeout
        });

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            throw new Error("OpenRouter returned an empty response.");
        }

        let content = response.data.choices[0].message.content;
        console.log("Raw OpenRouter response:", content);
        
        // Clean JSON if needed (remove markdown formatting)
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            return JSON.parse(content);
        } catch (parseError) {
            console.error("JSON Parse error:", content);
            throw new Error("The AI failed to format the brand/size data correctly. Please retry or enter manually.");
        }
    } catch (error: any) {
        console.error("OpenRouter API Error:", error.response?.data || error.message);
        const apiErrorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`AI Service Error: ${apiErrorMessage}`);
    }
}
