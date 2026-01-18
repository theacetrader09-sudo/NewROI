"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import AnnouncementPopup from "@/components/AnnouncementPopup";
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

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    {
      path: '/dashboard',
      label: 'Home',
      exact: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/dashboard/deposit',
      label: 'Deposit',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      path: '/dashboard/withdraw',
      label: 'Withdraw',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    },
    {
      path: '/dashboard/network',
      label: 'Network',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      path: '/dashboard/transactions',
      label: 'History',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      path: '/dashboard/settings',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', background: '#0F0916', minHeight: '100vh' }}>
      {/* Announcement Popup - Shows once per session */}
      <AnnouncementPopup />

      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? '0' : '300px',
        padding: isMobile ? '0' : '40px',
        maxWidth: isMobile ? '100%' : '1200px',
        paddingBottom: isMobile ? '100px' : '40px'
      }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation - Clean 6-item grid */}
      {isMobile && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: 'linear-gradient(to top, rgba(15, 9, 22, 0.98) 0%, rgba(15, 9, 22, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: 'env(safe-area-inset-bottom, 8px)'
          }}
        >
          <div className="grid grid-cols-6 h-16">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.path : isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex flex-col items-center justify-center gap-1 transition-all"
                  style={{
                    color: active ? '#A855F7' : 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  <div
                    className="relative"
                    style={{
                      transform: active ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    {item.icon}
                    {active && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: '#A855F7' }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[9px] font-semibold"
                    style={{
                      opacity: active ? 1 : 0.8
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @media (max-width: 767px) {
          body {
            background-color: #0F0916 !important;
          }
        }
      `}</style>
    </div>
  );
}
