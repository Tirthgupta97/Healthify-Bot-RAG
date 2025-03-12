import fs from 'fs';
import pdf from 'pdf-parse';

export async function extractPDFText(pdfPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw error;
    }
}