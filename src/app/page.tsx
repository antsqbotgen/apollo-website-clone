import Header from "@/components/sections/header";
import HeroCarousel from "@/components/sections/hero-carousel";
import HelpOptionsSection from "@/components/sections/help-options";
import RecommendedPackages from "@/components/sections/recommended-packages";
import LifestylePackages from "@/components/sections/lifestyle-packages";
import HealthCheckupSection from "@/components/sections/health-checkup-sections";
import MostBookedTests from "@/components/sections/most-booked-tests";
import BodyOrgansTests from "@/components/sections/body-organs-tests";
import Statistics from "@/components/sections/statistics";
import ProcessTimeline from "@/components/sections/process-timeline";
import ExperienceSection from "@/components/sections/experience-section";
import Testimonials from "@/components/sections/testimonials";
import Footer from "@/components/sections/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroCarousel />
        <HelpOptionsSection />
        <RecommendedPackages />
        <LifestylePackages />
        <HealthCheckupSection />
        <MostBookedTests />
        <BodyOrgansTests />
        <Statistics />
        <ProcessTimeline />
        <ExperienceSection />
        <Testimonials />
      </main>
      
      <Footer />
    </div>
  );
}