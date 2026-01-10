"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Home, Wallet, Send, MoreHorizontal, Package, Users, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mobileNavItems = [
    { id: "dashboard", icon: <Home size={20} />, label: "Home", path: "/dashboard" },
    { id: "activate", icon: <Package size={20} />, label: "Activate", path: "/dashboard/activate" },
    { id: "deposit", icon: <Wallet size={20} />, label: "Deposit", path: "/dashboard/deposit" },
    { id: "withdraw", icon: <Send size={20} />, label: "Withdraw", path: "/dashboard/withdraw" },
    { id: "network", icon: <Users size={20} />, label: "Network", path: "/dashboard/network" },
    { id: "transactions", icon: <BarChart3 size={20} />, label: "Transactions", path: "/dashboard/transactions" },
    { id: "settings", icon: <Settings size={20} />, label: "More", path: "/dashboard/settings" }
  ];


  return (
    <div style={{ display: 'flex', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? '0' : '300px',
        padding: isMobile ? '20px 0 80px 0' : '40px',
        maxWidth: isMobile ? '100%' : '1200px',
        paddingBottom: isMobile ? 'max(80px, env(safe-area-inset-bottom))' : '40px'
      }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          {mobileNavItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`mobile-nav-item ${pathname === item.path ? 'active' : ''}`}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}

          <style jsx>{`
            .mobile-bottom-nav {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: calc(80px + env(safe-area-inset-bottom));
              background: rgba(10, 10, 18, 0.95);
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 10px 12px calc(10px + env(safe-area-inset-bottom)) 12px;
              z-index: 100;
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              overflow-x: auto;
              overflow-y: hidden;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              gap: 12px;
            }
            
            .mobile-bottom-nav::-webkit-scrollbar {
              display: none;
            }

            .mobile-nav-item {
              flex: 0 0 auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 5px;
              padding: 10px 16px;
              text-decoration: none;
              color: rgba(255, 255, 255, 0.5);
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
              border-radius: 20px;
              position: relative;
              background: transparent;
              min-width: 60px;
              text-align: center;
            }

            /* Tap animation - bounce effect */
            .mobile-nav-item:active {
              transform: scale(0.85);
            }

            /* Pill button active state */
            .mobile-nav-item.active {
              color: #ffffff;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              box-shadow: 
                0 4px 15px rgba(102, 126, 234, 0.4),
                0 0 20px rgba(102, 126, 234, 0.2);
              padding: 8px 18px;
              animation: pillPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            @keyframes pillPop {
              0% { transform: scale(0.8); opacity: 0.5; }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }

            /* Glow pulse animation for active item */
            .mobile-nav-item.active::before {
              content: '';
              position: absolute;
              inset: -2px;
              border-radius: 22px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              z-index: -1;
              opacity: 0;
              animation: glowPulse 2s ease-in-out infinite;
            }

            @keyframes glowPulse {
              0%, 100% { opacity: 0; transform: scale(1); }
              50% { opacity: 0.3; transform: scale(1.05); }
            }

            .mobile-nav-item.active .nav-icon {
              color: #ffffff;
              transform: scale(1.1);
              animation: iconBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            @keyframes iconBounce {
              0% { transform: scale(0.5) rotate(-10deg); }
              50% { transform: scale(1.2) rotate(5deg); }
              100% { transform: scale(1.1) rotate(0deg); }
            }

            /* Hover state for non-active items */
            .mobile-nav-item:hover:not(.active) {
              color: rgba(255, 255, 255, 0.8);
              background: rgba(255, 255, 255, 0.08);
              transform: translateY(-2px);
            }

            .nav-icon {
              color: inherit;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 24px;
              width: 24px;
              transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              flex-shrink: 0;
              margin: 0 auto;
            }

            .nav-label {
              font-size: 0.65rem;
              font-weight: 600;
              text-align: center;
              line-height: 1.2;
              color: inherit;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              letter-spacing: 0.2px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              transition: all 0.3s ease;
              width: 100%;
              display: block;
            }

            /* Active label styling */
            .mobile-nav-item.active .nav-label {
              font-weight: 700;
              letter-spacing: 0.4px;
            }

            @media (min-width: 768px) {
              .mobile-bottom-nav {
                display: none;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
