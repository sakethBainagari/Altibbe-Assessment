export interface Product {
  id?: string;
  name: string;
  category: string;
  questions: Question[];
  answers: Answer[];
  createdAt?: Date;
}

export interface Question {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  required: boolean;
  options?: string[]; // For select type questions
}

export interface Answer {
  questionId: string;
  answer: string | number | boolean;
}

export interface FormData {
  name: string;
  category: string;
  questions: Question[]; // Add questions to FormData
  answers: Answer[];
}

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Food & Beverage', 
  'Clothing',
  'Health & Beauty',
  'Home & Garden',
  'Automotive',
  'Other'
] as const;
