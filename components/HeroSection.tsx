"use client";

import { useState } from "react";
import GetStartedButton from "./GetStartedButton";
import DeliverabilityChart from "./DeliverabilityChart";
import OrderPopup from "./OrderPopup";

const HeroSection = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center pt-20" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #141414 100%)" }}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.25) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.2) 0%, transparent 70%)' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse delay-2000" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.15) 0%, transparent 70%)' }}></div>
      </div>

      {/* Gradient Overlay for Depth */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(255, 110, 64, 0.05) 0%, transparent 60%)" }}></div>

      <div className="container mx-auto px-6 lg:px-20 py-16 w-full relative z-10">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left Column - Content */}
          <div className="space-y-10 text-left flex flex-col justify-center h-full">
            {/* Enhanced Badge */}
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-3 shadow-lg shadow-orange-500/20">
                <span className="rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)' }}>
                  New
                </span>
                <span className="text-sm font-semibold text-white tracking-wide">
                  Email deliverability enhanced
                </span>
              </div>
            </div>

            <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] xl:text-[5rem] font-bold text-white leading-[1.1] tracking-tight animate-fade-in-up">
              Scale Your
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Email Deliverability</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 leading-relaxed animate-fade-in-up max-w-2xl font-light">
              Transform your email infrastructure with our enterprise-grade inbox management solution.
              Reach more inboxes, boost engagement, and scale your outreach effortlessly.
            </p>

            <div className="flex flex-wrap items-center justify-start gap-5 pt-4 animate-fade-in-up">
              <GetStartedButton onClick={() => setIsPopupOpen(true)} />
              <a href="#comparison" className="rounded-full px-10 py-4 text-lg font-semibold backdrop-blur-xl text-white transition-all duration-500 border group relative overflow-hidden flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare Plans
              </a>
            </div>
          </div>

          {/* Right Column - Chart */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up">
            <DeliverabilityChart />
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      <OrderPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </section>
  );
};

export default HeroSection;
