"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="welcome-container">
      {/* Animated Background Blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* Top Section - Logo */}
      <div className="logo-section">
        <div className="logo-container">
          <TrendingUp className="logo-icon" color="#fff" />
        </div>
      </div>

      {/* Main Content - Grows to fill space */}
      <div className="content-section">
        <h1 className="main-heading">
          Smart investing<br />on your phone
        </h1>

        <p className="main-description">
          Join the MLM ROI network and start earning daily returns with our secure investment platform.
        </p>

        {/* Feature Pills */}
        <div className="feature-pills">
          {[
            { icon: <TrendingUp size={16} />, text: '1% Daily ROI' },
            { icon: <Users size={16} />, text: '10-Level Network' },
            { icon: <Shield size={16} />, text: 'Secure & Safe' }
          ].map((feature, idx) => (
            <div key={idx} className="feature-pill">
              {feature.icon}
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - CTA Buttons */}
      <div className="cta-section">
        <Link href="/register" className="link-no-decoration">
          <button className="btn-get-started">
            Get started
            <ArrowRight size={20} />
          </button>
        </Link>

        <div className="sign-in-text">
          Already have an account?{' '}
          <Link href="/login" className="sign-in-link">
            Sign in
          </Link>
        </div>
      </div>

      <style jsx>{`
                .welcome-container {
                    min-height: 100dvh;
                    min-height: -webkit-fill-available;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
                    display: flex;
                    flexDirection: column;
                    justify-content: space-between;
                    padding: max(env(safe-area-inset-top), 20px) max(env(safe-area-inset-right), 20px) max(env(safe-area-inset-bottom), 20px) max(env(safe-area-inset-left), 20px);
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .blob {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.1);
                    borderRadius: 50%;
                    filter: blur(60px);
                    pointer-events: none;
                }

                .blob-1 {
                    top: -10%;
                    right: -10%;
                    width: min(300px, 50vw);
                    height: min(300px, 50vw);
                    animation: float 6s ease-in-out infinite;
                }

                .blob-2 {
                    bottom: -10%;
                    left: -10%;
                    width: min(250px, 45vw);
                    height: min(250px, 45vw);
                    background: rgba(255, 255, 255, 0.15);
                    filter: blur(50px);
                    animation: float 8s ease-in-out infinite reverse;
                }

                .logo-section {
                    position: relative;
                    z-index: 1;
                    flex-shrink: 0;
                }

                .logo-container {
                    width: clamp(48px, 12vw, 60px);
                    height: clamp(48px, 12vw, 60px);
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: clamp(12px, 3vw, 16px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: clamp(20px, 5vh, 32px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .logo-icon {
                    width: clamp(24px, 6vw, 32px);
                    height: clamp(24px, 6vw, 32px);
                }

                .content-section {
                    position: relative;
                    z-index: 1;
                    flex: 1 1 auto;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    min-height: 0;
                    padding-bottom: clamp(20px, 4vh, 40px);
                }

                .main-heading {
                    font-size: clamp(1.75rem, 6.5vw + 0.5rem, 3rem);
                    font-weight: 800;
                    color: #ffffff;
                    line-height: 1.15;
                    margin-bottom: clamp(16px, 3vh, 24px);
                    letter-spacing: -0.02em;
                    word-break: break-word;
                }

                .main-description {
                    font-size: clamp(0.95rem, 3vw + 0.25rem, 1.125rem);
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.5;
                    margin-bottom: clamp(24px, 4vh, 40px);
                    max-width: 90%;
                    word-break: break-word;
                }

                .feature-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: clamp(8px, 2vw, 12px);
                    margin-bottom: clamp(24px, 4vh, 40px);
                }

                .feature-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: clamp(6px, 1.5vw, 8px);
                    padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: #fff;
                    font-size: clamp(0.8rem, 2.5vw, 0.9rem);
                    font-weight: 500;
                    white-space: nowrap;
                }

                .cta-section {
                    position: relative;
                    z-index: 1;
                    flex-shrink: 0;
                    padding-top: clamp(16px, 3vh, 24px);
                }

                .link-no-decoration {
                    text-decoration: none;
                }

                .btn-get-started {
                    width: 100%;
                    min-height: 56px;
                    padding: clamp(14px, 3.5vh, 18px) 20px;
                    background: #1a1a1a;
                    color: #ffffff;
                    border: none;
                    border-radius: clamp(12px, 3vw, 16px);
                    font-size: clamp(0.95rem, 2.8vw, 1.1rem);
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: clamp(12px, 2.5vh, 16px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: clamp(8px, 2vw, 12px);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    user-select: none;
                }

                .btn-get-started:active {
                    transform: scale(0.98);
                }

                .sign-in-text {
                    text-align: center;
                    font-size: clamp(0.85rem, 2.5vw, 0.95rem);
                    color: rgba(255, 255, 255, 0.9);
                    padding-bottom: env(safe-area-inset-bottom);
                }

                .sign-in-link {
                    color: #ffffff;
                    font-weight: 600;
                    text-decoration: none;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
                    padding-bottom: 2px;
                    -webkit-tap-highlight-color: transparent;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }

                @media (min-width: 768px) {
                    .welcome-container > * {
                        max-width: 500px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                }

                @media (max-height: 667px) {
                    .main-heading {
                        font-size: clamp(1.5rem, 6vw, 2.2rem);
                    }
                }

                * {
                    -webkit-touch-callout: none;
                    box-sizing: border-box;
                }
            `}</style>
    </div>
  );
}
