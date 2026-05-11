import Tesseract from 'tesseract.js';

export async function extractShoeLabel(base64Image: string) {
    try {
        console.log("Starting local OCR extraction...");
        const result = await Tesseract.recognize(
            base64Image,
            'eng',
            { logger: m => console.log(m) }
        );

        const text = result.data.text;
        console.log("Raw OCR Text:", text);

        return parseOCRText(text);
    } catch (error: any) {
        console.error("OCR Error:", error);
        throw new Error("Failed to read the label locally. Please try a clearer photo or enter details manually.");
    }
}

function parseOCRText(text: string) {
    const lines = text.split('\n').map(l => l.trim());
    const data = {
        shoeName: '',
        brand: '',
        euSize: '',
        usSize: '',
        ukSize: '',
        color: '',
        sku: '',
        quantity: '1',
    };

    // 1. Detect Brand
    const brands = ['NIKE', 'ADIDAS', 'PUMA', 'REEBOK', 'NEW BALANCE', 'ASICS', 'VANS', 'CONVERSE', 'SKECHERS', 'JORDAN'];
    for (const brand of brands) {
        if (text.toUpperCase().includes(brand)) {
            data.brand = brand;
            break;
        }
    }

    // 2. Detect Sizes (Look for labels followed by numbers)
    // UK Size
    const ukMatch = text.match(/UK\s*[:\-\s]?\s*([0-9]+(?:\.[0-9]+)?|[A-Z]+)/i);
    if (ukMatch) data.ukSize = ukMatch[1];

    // US Size
    const usMatch = text.match(/US\s*[:\-\s]?\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (usMatch) data.usSize = usMatch[1];

    // EU Size
    const euMatch = text.match(/(?:EU|EUR|FR)\s*[:\-\s]?\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (euMatch) data.euSize = euMatch[1];

    // 3. Detect SKU (Common patterns: 6-3 digits or strings with dashes)
    // Example: CU4111-100 or 123456-789
    const skuMatch = text.match(/([A-Z0-9]{5,10}-[A-Z0-9]{3})/i);
    if (skuMatch) {
        data.sku = skuMatch[1].toUpperCase();
    } else {
        // Fallback for simple number strings that might be SKU
        const basicSku = text.match(/(?:ART|SKU|STYLE)\s*[:\-\s]?\s*([A-Z0-9\-]{5,15})/i);
        if (basicSku) data.sku = basicSku[1].toUpperCase();
    }

    // 4. Heuristic for Shoe Name
    // Usually one of the first few lines that isn't the brand
    const possibleName = lines.find(line => 
        line.length > 3 && 
        !brands.some(b => line.toUpperCase().includes(b)) &&
        !line.match(/[0-9]/) // Simple check: usually names don't start with lots of numbers
    );
    if (possibleName) data.shoeName = possibleName;

    return data;
}
