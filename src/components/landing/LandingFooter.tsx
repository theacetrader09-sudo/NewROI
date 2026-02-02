import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";

export default function LandingFooter() {
    const footerLinks = {
        product: [
            { name: "Features", href: "#features" },
            { name: "Pricing", href: "#pricing" },
            { name: "Dashboard", href: "/dashboard" },
            { name: "API", href: "#" },
        ],
        company: [
            { name: "About Us", href: "#" },
            { name: "Careers", href: "#" },
            { name: "Blog", href: "#" },
            { name: "Press Kit", href: "#" },
        ],
        resources: [
            { name: "Documentation", href: "#" },
            { name: "Help Center", href: "#" },
            { name: "Community", href: "#" },
            { name: "Contact", href: "#" },
        ],
        legal: [
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
            { name: "Cookie Policy", href: "#" },
            { name: "Disclaimer", href: "#" },
        ],
    };

    const socialLinks = [
        { name: "Twitter", icon: Twitter, href: "#" },
        { name: "Facebook", icon: Facebook, href: "#" },
        { name: "Instagram", icon: Instagram, href: "#" },
        { name: "LinkedIn", icon: Linkedin, href: "#" },
        { name: "GitHub", icon: Github, href: "#" },
    ];

    return (
        <footer className="bg-black border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">N</span>
                            </div>
                            <span className="text-white font-bold text-xl">NovaQuant</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6">
                            The future of automated earnings. Build wealth through our AI-powered ROI system.
                        </p>
                        {/* Social Links */}
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors group"
                                        aria-label={social.name}
                                    >
                                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-gray-500 text-sm mb-4 md:mb-0">
                        © {new Date().getFullYear()} NovaQuant. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <span className="text-gray-500 text-sm">Made with ❤️ for investors</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
