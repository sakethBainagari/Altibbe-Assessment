// Test PDF generation
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple PDF test endpoint
app.get('/test-pdf-generation', async (req, res) => {
  try {
    console.log('Testing PDF generation...');
    
    // Test data
    const testData = {
      name: 'Test Product',
      category: 'Electronics',
      questions: [],
      answers: [
        { questionId: 'quality', answer: 'High quality materials used' },
        { questionId: 'sustainability', answer: true },
        { questionId: 'warranty', answer: '2 years' }
      ]
    };

    // Try jsPDF fallback
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('PDF Generation Test', 20, 30);
    doc.setFontSize(12);
    doc.text('This is a test PDF to verify generation works', 20, 50);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 70);

    const pdfOutput = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfOutput);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-report.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    console.log('Test PDF generated successfully');

  } catch (error) {
    console.error('Test PDF generation failed:', error);
    res.status(500).json({ 
      error: 'PDF generation failed', 
      message: error.message 
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`PDF test server running on http://localhost:${PORT}`);
  console.log('Test PDF endpoint: http://localhost:3002/test-pdf-generation');
});
