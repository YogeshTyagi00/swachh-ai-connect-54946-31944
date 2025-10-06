import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import Features from "@/components/sections/Features";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
