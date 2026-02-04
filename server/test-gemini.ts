
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Testing Gemini API with gemini-3-flash-preview...");
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const result = await model.generateContent('Say hello');
        console.log("SUCCESS");
        console.log(result.response.text());
    } catch (e: any) {
        console.log("ERROR_START");
        console.log(e.message || e.toString());
        console.log("ERROR_END");
    }
}
test();
