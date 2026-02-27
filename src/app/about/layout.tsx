import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
    title: "About Us — NeoQuant",
    description: "Learn about NeoQuant's mission to democratize AI-powered trading and empower every investor through intelligent automation and a 10-level referral network.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020207] overflow-x-hidden">
            <LandingNav />
            {children}
            <LandingFooter />
        </div>
    );
}
