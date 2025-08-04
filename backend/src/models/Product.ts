import mongoose, { Document, Schema } from 'mongoose';

// Interface for Product document
export interface IProduct extends Document {
  name: string;
  category: string;
  userId?: string;  // Optional for backward compatibility
  companyName?: string;
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
  transparencyScore?: {
    overall_score: number;
    breakdown: {
      completeness: number;
      quality: number;
      transparency: number;
      compliance: number;
    };
    score_level: string;
    recommendations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Product Schema
const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    enum: ['Electronics', 'Food & Beverage', 'Clothing', 'Health & Beauty', 'Home & Garden', 'Automotive', 'Other']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for backward compatibility
  },
  companyName: {
    type: String,
    trim: true
  },
  questions: [{
    id: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'number', 'boolean', 'select', 'textarea']
    },
    required: {
      type: Boolean,
      default: false
    }
  }],
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true
    }
  }],
  transparencyScore: {
    overall_score: {
      type: Number,
      min: 0,
      max: 100
    },
    breakdown: {
      completeness: { type: Number, min: 0, max: 100 },
      quality: { type: Number, min: 0, max: 100 },
      transparency: { type: Number, min: 0, max: 100 },
      compliance: { type: Number, min: 0, max: 100 }
    },
    score_level: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Needs Improvement']
    },
    recommendations: [{ type: String }]
  }
}, {
  timestamps: true
});

// Create and export the model
export const Product = mongoose.model<IProduct>('Product', ProductSchema);
