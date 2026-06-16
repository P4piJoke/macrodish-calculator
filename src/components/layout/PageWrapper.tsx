import { type ReactNode } from "react";
import Navbar from "./Navbar";

interface Props {
  children: ReactNode;
}

export default function PageWrapper({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}