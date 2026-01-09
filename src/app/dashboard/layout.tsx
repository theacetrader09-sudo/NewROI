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
              height: calc(76px + env(safe-area-inset-bottom));
              background: linear-gradient(180deg, rgba(10, 10, 20, 0.98) 0%, rgba(15, 15, 25, 0.98) 100%);
              border-top: 1.5px solid rgba(102, 126, 234, 0.25);
              display: flex;
              justify-content: flex-start;
              align-items: center;
              padding: 12px 16px calc(12px + env(safe-area-inset-bottom)) 16px;
              z-index: 100;
              backdrop-filter: blur(30px);
              -webkit-backdrop-filter: blur(30px);
              overflow-x: auto;
              overflow-y: hidden;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              gap: 16px;
              box-shadow: 0 -6px 30px rgba(0, 0, 0, 0.4), 0 -1px 10px rgba(102, 126, 234, 0.1);
            }
            
            .mobile-bottom-nav::-webkit-scrollbar {
              display: none;
            }

            .mobile-nav-item {
              flex: 0 0 auto;
              min-width: 70px;
              max-width: 85px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 6px;
              padding: 10px 8px;
              text-decoration: none;
              color: rgba(255, 255, 255, 0.45);
              transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
              -webkit-tap-highlight-color: transparent;
              touch-action: manipulation;
              border-radius: 14px;
              position: relative;
              background: transparent;
            }

            .mobile-nav-item:active {
              transform: scale(0.92);
              background: rgba(102, 126, 234, 0.08);
            }

            .mobile-nav-item.active {
              color: #ffffff;
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.12) 100%);
              box-shadow: inset 0 0 20px rgba(102, 126, 234, 0.15);
            }

            .mobile-nav-item.active::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 36px;
              height: 3.5px;
              background: linear-gradient(90deg, #667eea 0%, #00d4ff 100%);
              border-radius: 0 0 4px 4px;
              box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
            }

            .mobile-nav-item.active .nav-icon {
              color: #667eea;
              transform: scale(1.15);
              filter: drop-shadow(0 2px 6px rgba(102, 126, 234, 0.4));
            }

            .mobile-nav-item:hover:not(.active) {
              color: rgba(255, 255, 255, 0.7);
              background: rgba(102, 126, 234, 0.05);
            }

            .nav-icon {
              color: inherit;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 24px;
              width: 24px;
              transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
              flex-shrink: 0;
            }

            .nav-label {
              font-size: 0.7rem;
              font-weight: 600;
              text-align: center;
              line-height: 1;
              color: inherit;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
              letter-spacing: 0.3px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            @media (min-width: 768px) {
              .mobile-bottom-nav {
                display: none;
              }
            }
            
            /* Scroll hint indicators */
            @media (max-width: 767px) {
              .mobile-bottom-nav::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                bottom: env(safe-area-inset-bottom);
                width: 30px;
                background: linear-gradient(90deg, transparent 0%, rgba(15, 15, 25, 0.95) 100%);
                pointer-events: none;
                z-index: 1;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
