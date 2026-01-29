import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-6">
      <div className="text-center max-w-4xl mx-auto">
        {/* Logo/Brand */}
        <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6">
          MLM ROI System
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-white/80 mb-12">
          Your Investment Platform - Coming Soon
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="px-8 py-4 bg-white text-purple-900 font-bold rounded-lg hover:bg-purple-50 transition-all hover:scale-105 shadow-xl"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-purple-800/50 text-white font-bold rounded-lg hover:bg-purple-700 transition-all border border-white/20"
          >
            Login
          </Link>
        </div>

        {/* Note */}
        <p className="text-white/60 text-sm">
          Landing page design will be integrated soon
        </p>
      </div>
    </div>
  );
}
