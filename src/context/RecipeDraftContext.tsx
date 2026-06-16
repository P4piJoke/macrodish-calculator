import { createContext, useContext, useState, type ReactNode } from "react";
import { type Ingredient } from "../types/Ingredient";

interface RecipeDraft {
  name:              string;
  cookedWeightGrams: number;
  ingredients:       Ingredient[];
}

interface RecipeDraftContextType {
  draft:     RecipeDraft | null;
  setDraft:  (draft: RecipeDraft | null) => void;
}

const RecipeDraftContext = createContext<RecipeDraftContextType>({
  draft:    null,
  setDraft: () => {},
});

export function RecipeDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<RecipeDraft | null>(null);
  return (
    <RecipeDraftContext.Provider value={{ draft, setDraft }}>
      {children}
    </RecipeDraftContext.Provider>
  );
}

export function useRecipeDraft() {
  return useContext(RecipeDraftContext);
}