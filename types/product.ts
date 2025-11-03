export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  categories: string[]; 
  brand: string; 
  colors: string[]; 
  sizes: string[];
  createdAt: string;
  updatedAt: string;
  layout: {
    "imageSize": "medium",
    "textAlignment": "left",
    "showDescription": true,
    "showPrice": true,
    "cardStyle": "detailed",
    "borderStyle": "outlined"
  }
}

