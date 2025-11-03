export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  productCount?: number;
  image?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId: string | null;
  image?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: string | null;
  image?: string;
}