export interface Product {
  id: string;
  name: string;
  brandId?: string;  // null = community/global product
  createdBy: string; // uid
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}