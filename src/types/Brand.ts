export interface Brand {
  id: string;
  name: string;
  ownerId: string;   // uid of the brand user who registered it
  logoUrl?: string;
}