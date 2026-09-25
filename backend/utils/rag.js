import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

// 1. Initialize the NEW Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

// 2. ATS Weights
const WEIGHTS = { skills: 0.40, experience: 0.25, education: 0.10, title: 0.15, semantic: 0.10 };

// 3. Verdict Helper
const verdictFor = (s) =>
  s >= 75 ? { label: 'Strong match', level: 'high' } : s >= 55 ? { label: 'Moderate match', level: 'mid' } : { label: 'Low match', level: 'low' };

/**
 * Main ATS Scoring Function using Gemini 3.8
 */
export const getAtsScoreAndAnalysis = async (resumeText, jobDescription, jobTitle = '') => {
  try {
    if (!resumeText?.trim() || !jobDescription?.trim()) return { score: 0, analysis: null };

    // 4. Prompt Gemini with explicit JSON format instructions
    const prompt = `
      You are an expert ATS (Applicant Tracking System). Analyze the candidate's resume against the Job Description.
      Be highly accurate. If a JD asks for 0-2 years, a fresher gets a 100 on experience. 
      If the candidate has completely different experience (e.g. Data Science applying for Frontend), score semanticContext low.
      
      Job Title Context: ${jobTitle || "Infer from JD"}
      
      === JOB DESCRIPTION ===
      ${jobDescription}
      
      === RESUME ===
      ${resumeText}

      === REQUIRED OUTPUT FORMAT ===
      You MUST return ONLY valid JSON. Do not use markdown blocks (\`\`\`json). Just the raw JSON object matching this exact structure:
      {
        "skills": { "score": 0, "found": ["skill1"], "missing": ["skill2"] },
        "experience": { "score": 0, "detail": "string" },
        "education": { "score": 0, "detail": "string" },
        "titleFit": { "score": 0, "detail": "string" },
        "semanticContext": 0,
        "recommendations": ["tip 1", "tip 2", "tip 3"]
      }
    `;

    // 5. Call the new Gemini 3.8 Flash model
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
    });

    // 6. Parse the output text safely
    let rawText = interaction.output_text.trim();
    
    // Strip markdown formatting if the AI includes it by mistake
    if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const aiData = JSON.parse(rawText);

    // 7. Calculate Final Weighted Score programmatically
    let rawScore = 
      (aiData.skills.score * WEIGHTS.skills) +
      (aiData.experience.score * WEIGHTS.experience) +
      (aiData.education.score * WEIGHTS.education) +
      (aiData.titleFit.score * WEIGHTS.title) +
      (aiData.semanticContext * WEIGHTS.semantic);
      
    const finalScore = Math.round(rawScore);

    // 8. Map to your frontend's expected format
    return {
      score: finalScore,
      verdict: verdictFor(finalScore),
      analysis: {
        skills: { score: aiData.skills.score, found: aiData.skills.found, missing: aiData.skills.missing },
        experience: { score: aiData.experience.score, detail: aiData.experience.detail },
        education: { score: aiData.education.score, detail: aiData.education.detail },
        title: { score: aiData.titleFit.score, detail: aiData.titleFit.detail },
        semantic: { score: aiData.semanticContext, detail: "AI contextual evaluation" },
        breakdown: [
          { label: 'Skills match', score: aiData.skills.score, weight: WEIGHTS.skills },
          { label: 'Experience', score: aiData.experience.score, weight: WEIGHTS.experience },
          { label: 'Education', score: aiData.education.score, weight: WEIGHTS.education },
          { label: 'Role fit', score: aiData.titleFit.score, weight: WEIGHTS.title },
          { label: 'Context relevance', score: aiData.semanticContext, weight: WEIGHTS.semantic },
        ],
        recommendations: aiData.recommendations
      }
    };

  } catch (error) {
    console.error('ATS Gemini API Error:', error);
    return { score: 0, analysis: null, error: error.message };
  }
};

