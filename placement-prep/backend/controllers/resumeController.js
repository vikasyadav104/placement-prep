const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/temp');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read the uploaded PDF file from disk
    const fileBuffer = fs.readFileSync(req.file.path);

    // Extract text from the PDF
    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;

    // Save resume info to database
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      extractedText,
    });

    // Delete the temporary file from disk (we already extracted what we need)
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        textPreview: extractedText.substring(0, 200), // just first 200 chars, for confirmation
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadResume };