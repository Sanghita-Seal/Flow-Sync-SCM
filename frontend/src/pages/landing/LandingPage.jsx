import Nav from "./components/Nav";
import Hero from "./components/Hero";
import LoopSection from "./components/LoopSection";
import PlanSection from "./components/PlanSection";
import ExecuteSection from "./components/ExecuteSection";
import RespondSection from "./components/RespondSection";
import ClosingCTA from "./components/ClosingCTA";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page font-sans antialiased">
      <Nav />
      <main>
        <Hero />
        <LoopSection />
        <PlanSection />
        <ExecuteSection />
        <RespondSection />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}
