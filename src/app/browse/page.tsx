import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import BrowseContent from "@/components/BrowseContent";
import { Suspense } from "react";

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-bg selection:bg-gold/30 selection:text-gold">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen" />}>
        <BrowseContent />
      </Suspense>
      <Footer />
    </main>
  );
}
