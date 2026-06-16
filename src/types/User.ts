export type UserRole = "regular" | "brand";

export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  brandId?:   string;
  brandName?: string; // ← denormalized for easy access
}