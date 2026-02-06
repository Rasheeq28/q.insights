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
}

export interface User {
  id: string;
  email: string;
}
