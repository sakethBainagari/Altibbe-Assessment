import express, { Request, Response } from 'express';
import axios from 'axios';
import { Product, IProduct } from '../models/Product';
import { PDFService, ProductReportData } from '../services/pdfService';
import { FallbackPDFService } from '../services/fallbackPdfService';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

// POST /submit-product - Create a new product submission (requires authentication)
router.post('/submit-product', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, category, questions, answers } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Product name and category are required'
      });
    }

    // Calculate transparency score using AI service
    let transparencyScore = null;
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
      const scoreResponse = await axios.post(`${aiServiceUrl}/api/transparency-score`, {
        product_name: name,
        category,
        answers: answers || []
      });
      
      if (scoreResponse.data.success) {
        transparencyScore = scoreResponse.data.transparency_score;
      }
    } catch (error) {
      console.log('Could not calculate transparency score:', error);
      // Continue without score - it's optional
    }

    // Create new product
    const product = new Product({
      name: name.trim(),
      category,
      userId: req.user?._id,
      companyName: req.user?.companyName,
      questions: questions || [],
      answers: answers || [],
      transparencyScore
    });

    // Save to database
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product submitted successfully',
      data: {
        id: savedProduct._id,
        name: savedProduct.name,
        category: savedProduct.category,
        createdAt: savedProduct.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error submitting product:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: validationErrors.join(', ')
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to submit product'
    });
  }
});

// GET /products - Get all products (optional for testing)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .select('name category createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// GET /products/:id - Get a specific product
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// POST /generate-pdf - Generate PDF report for product data
router.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { name, category, questions, answers } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Product name and category are required'
      });
    }

    // Prepare data for PDF generation
    const productData: ProductReportData = {
      name: name.trim(),
      category,
      questions: questions || [],
      answers: answers || [],
      createdAt: new Date()
    };

    // Generate PDF with fallback
    let pdfBuffer: Buffer;
    try {
      // Try Puppeteer first
      pdfBuffer = await PDFService.generateProductPDF(productData);
    } catch (puppeteerError) {
      console.log('Puppeteer PDF generation failed, using fallback:', puppeteerError);
      // Use fallback method
      pdfBuffer = FallbackPDFService.generateSimplePDF(productData);
      
      // For fallback, we need to indicate it's plain text
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="product-report-${name.replace(/[^a-zA-Z0-9]/g, '-')}.txt"`);
    }

    // Set response headers for PDF download (if not already set by fallback)
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="product-report-${name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
    }
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'PDF generation failed',
      message: error.message || 'Failed to generate PDF report'
    });
  }
});

// GET /my-products - Get current user's products (requires authentication)
router.get('/my-products', authenticateToken, async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ userId: req.user?._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        count: products.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching user products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// GET /my-products - Get products for the authenticated user
router.get('/my-products', authenticateToken, async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ userId: req.user?._id })
      .sort({ createdAt: -1 })
      .select('-__v -answers -questions'); // Exclude detailed answers/questions for list view

    res.json({
      success: true,
      message: 'Your products retrieved successfully',
      data: {
        products,
        count: products.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching user products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your products',
      message: error.message
    });
  }
});

// GET /products - Get all products (admin only or public with limited info)
router.get('/products', optionalAuth, async (req: Request, res: Response) => {
  try {
    let query = {};
    let selectFields = 'name category createdAt transparencyScore.overall_score transparencyScore.score_level';
    
    // If user is authenticated and is admin, show all details
    if (req.user?.role === 'admin') {
      selectFields = '-__v';
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .select(selectFields)
      .limit(50); // Limit for performance

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        count: products.length,
        isAdmin: req.user?.role === 'admin'
      }
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

export default router;
