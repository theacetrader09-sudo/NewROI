import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "NovaQuant - The Future of Automated Earnings",
    description: "Join thousands of users earning passive income through our revolutionary AI-powered ROI distribution system. Start your journey today.",
    keywords: "ROI, passive income, automated earnings, investment, MLM, network marketing",
    openGraph: {
        title: "NovaQuant - The Future of Automated Earnings",
        description: "Build wealth through our AI-powered ROI system",
        type: "website",
    },
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
