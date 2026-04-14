export interface Dataset {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  updatedAt: string;
  source: string;
  tags: string[];
  fields?: string[]; // Simplified for list view
  previewData?: any[]; // For detail view
  totalRows?: number; // Fetched from backend aggregate count
  lastUpdated?: string; // Resolved from last row date natively
}

export interface User {
  id: string;
  email: string;
}
