import express from 'express';
import multer from 'multer';
import { PdfReader } from 'pdfreader';
import { getAtsScoreAndAnalysis } from '../utils/rag.js';

const router = express.Router();
// Use memory storage so we don't save PDF files to disk
const upload = multer({ storage: multer.memoryStorage() });

const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    let text = "";
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) reject(err);
      else if (!item) resolve(text);
      else if (item.text) text += item.text + " ";
    });
  });
};

// POST: Stateless analysis endpoint (No DB save)
// CHANGED: Route is now '/' so it precisely matches '/api/analyzer' from server.js
router.post('/', upload.single('resumePdf'), async (req, res) => {
  try {
    const { jobDescription, position } = req.body;
    let resumeText = '';

    if (!req.file) {
      return res.status(400).json({ error: "No resume PDF uploaded." });
    }

    try {
      resumeText = await extractTextFromPDF(req.file.buffer);
    } catch (pdfError) {
      return res.status(400).json({ error: "Failed to read the PDF file." });
    }

    // Call the Gemini logic directly
    const result = await getAtsScoreAndAnalysis(resumeText, jobDescription, position || "Target Role");

    if (!result.analysis || result.error) {
      return res.status(500).json({ error: `Gemini API Failed: ${result.error || 'Analysis failed'}` });
    }

    // Return the payload directly to the frontend
    res.status(200).json({
      score: result.score,
      analysis: result.analysis
    });

  } catch (error) {
    console.error("Instant Analyzer Error:", error.message);
    res.status(500).json({ error: "Server error during analysis" });
  }
});

export default router;