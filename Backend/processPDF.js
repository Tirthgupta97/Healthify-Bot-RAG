import { promises as fs } from "fs";
import pdfParse from "pdf-parse";

export async function extractPDFText(pdfPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("❌ Error reading PDF:", error);
    return "";
  }
}