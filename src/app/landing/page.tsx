import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import PartnersMarquee from "@/components/landing/PartnersMarquee";
import StatsRibbon from "@/components/landing/StatsRibbon";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Timeline from "@/components/landing/Timeline";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black overflow-x-hidden">
            <LandingNav />
            <HeroSection />
            <PartnersMarquee />
            <StatsRibbon />
            <FeaturesGrid />
            <Timeline />
            <FAQSection />
            <CTASection />
            <LandingFooter />
        </div>
    );
}
