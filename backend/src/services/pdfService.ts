import puppeteer from 'puppeteer';
import { IProduct } from '../models/Product';

export interface ProductReportData {
  name: string;
  category: string;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    required: boolean;
  }>;
  answers: Array<{
    questionId: string;
    answer: string | number | boolean;
  }>;
  createdAt?: Date;
}

export class PDFService {
  private static generateHTML(productData: ProductReportData): string {
    const formatAnswer = (answer: string | number | boolean): string => {
      if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
      return String(answer);
    };

    const formatQuestionId = (id: string): string => {
      return id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Product Transparency Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            
            .header h1 {
              color: #2563eb;
              font-size: 2.5em;
              margin-bottom: 10px;
            }
            
            .header p {
              color: #666;
              font-size: 1.1em;
            }
            
            .section {
              margin-bottom: 30px;
              background: #f8fafc;
              padding: 25px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
            }
            
            .section h2 {
              color: #1e40af;
              font-size: 1.5em;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            
            .section h2::before {
              content: '📋';
              margin-right: 10px;
              font-size: 1.2em;
            }
            
            .basic-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .info-item {
              background: white;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
            }
            
            .info-label {
              font-weight: 600;
              color: #475569;
              font-size: 0.9em;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            
            .info-value {
              font-size: 1.1em;
              color: #1e293b;
              font-weight: 500;
            }
            
            .answer-item {
              background: white;
              margin-bottom: 15px;
              padding: 20px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .answer-question {
              font-weight: 600;
              color: #374151;
              margin-bottom: 8px;
              font-size: 1em;
            }
            
            .answer-value {
              color: #1f2937;
              font-size: 1em;
              line-height: 1.5;
              padding: 10px;
              background: #f1f5f9;
              border-radius: 4px;
              border-left: 3px solid #2563eb;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              color: #6b7280;
              font-size: 0.9em;
            }
            
            .generated-date {
              background: #eff6ff;
              padding: 10px;
              border-radius: 6px;
              border: 1px solid #bfdbfe;
              display: inline-block;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .section {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Product Transparency Report</h1>
            <p>Comprehensive product information and assessment</p>
          </div>
          
          <div class="section">
            <h2>Basic Information</h2>
            <div class="basic-info">
              <div class="info-item">
                <div class="info-label">Product Name</div>
                <div class="info-value">${productData.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Category</div>
                <div class="info-value">${productData.category}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Detailed Assessment</h2>
            ${productData.answers.map(answer => {
              const questionObj = productData.questions.find(q => q.id === answer.questionId);
              const questionText = questionObj ? questionObj.question : formatQuestionId(answer.questionId);
              return `
              <div class="answer-item">
                <div class="answer-question">${questionText}</div>
                <div class="answer-value">${formatAnswer(answer.answer)}</div>
              </div>`;
            }).join('')}
          </div>
          
          <div class="footer">
            <div class="generated-date">
              <strong>Report Generated:</strong> ${new Date().toLocaleString()}
            </div>
            <p style="margin-top: 15px;">
              This report was automatically generated by the Altibbe Product Transparency System
            </p>
          </div>
        </body>
      </html>
    `;
  }

  static async generateProductPDF(productData: ProductReportData): Promise<Buffer> {
    let browser;
    
    try {
      // Launch Puppeteer with Vercel-compatible settings
      browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--single-process',
          '--disable-extensions',
          '--disable-default-apps',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });

      const page = await browser.newPage();
      
      // Set viewport and optimize for PDF
      await page.setViewport({ width: 1200, height: 800 });
      
      // Set content with longer timeout
      const html = this.generateHTML(productData);
      await page.setContent(html, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });

      // Wait a bit for any styling to apply
      await page.waitForTimeout(1000);

      // Generate PDF with optimized settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 5px;">
            Product Transparency Report - ${productData.name}
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 5px;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
        timeout: 15000
      });

      return Buffer.from(pdfBuffer);

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error?.message || 'Unknown error');
      throw new Error(`PDF generation failed: ${error?.message || 'Unknown error'}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
      }
    }
  }
}
