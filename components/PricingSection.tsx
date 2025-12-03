"use client";

import React, { useState } from "react";
import GetStartedButton from "./GetStartedButton";
import OrderPopup from "./OrderPopup";

const PricingSection = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const features = [
    "100% Automated Setup",
    "24 Hour Turnaround",
    "SPF / DKIM / Strict DMARC",
    "Premium 1-on-1 Support",
    "Full API Access",
    "Multi-Name Input or CSV Upload",
    "Tenant-Safe Architecture",
    "49 Inboxes Per Domain",
    "250 Outbound Emails/Day/Domain",
    "Full Deletion & Domain Swapping"
  ];

  return (
    <section id="pricing" className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 50%, #141414 100%)" }}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.25) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.2) 0%, transparent 70%)' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse delay-2000" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.15) 0%, transparent 70%)' }}></div>
      </div>

      <div className="container mx-auto px-6 lg:px-20 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 backdrop-blur-md rounded-full px-6 py-3 inline-flex items-center gap-3 mb-8 shadow-lg shadow-orange-500/10">
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
            <span className="text-sm font-semibold text-orange-400 tracking-wide">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 tracking-tight">
            <span className="font-normal text-white">Simple,</span>{' '}
            <span className="font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-gray-300 font-light">
            No hidden fees. No surprises. Just straightforward pricing that scales with your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* BYOD Card */}
          <div
            className="rounded-3xl p-10 lg:p-12 border relative overflow-hidden group transition-all duration-700 hover:-translate-y-2 shadow-2xl hover:shadow-orange-500/5"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full opacity-0 group-hover:opacity-15 transition-all duration-700 blur-3xl" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)' }}></div>
            <div className="relative z-10">
              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2">
                Bring Your Own Domain
              </h3>
              <p className="text-gray-400 mb-8">
                Use your existing domain
              </p>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-white/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-white">$10</span>
                  <span className="text-xl text-gray-400">/domain</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-10">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">50 Microsoft Partner accounts per domain</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">200 emails per day per account</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">100% Automated Setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">24 Hour Turnaround</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">SPF / DKIM / Strict DMARC</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">Premium 1-on-1 Support</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setIsPopupOpen(true)}
                className="w-full rounded-xl py-3.5 font-semibold transition-all duration-300 border"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Full Package Card - Featured */}
          <div
            className="rounded-3xl p-10 lg:p-12 border-2 relative overflow-hidden transition-all duration-700 hover:-translate-y-2 shadow-2xl hover:shadow-orange-500/20"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 110, 64, 0.12) 0%, rgba(255, 110, 64, 0.04) 100%)',
              borderColor: '#ff6e40',
            }}
          >
            {/* Enhanced Popular badge */}
            <div className="absolute top-6 right-6">
              <span
                className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg shadow-orange-500/30"
                style={{ background: 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)' }}
              >
                POPULAR
              </span>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)' }}></div>

            <div className="relative z-10">
              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2">
                Full Package
              </h3>
              <p className="text-gray-300 mb-8">
                Domain registration included
              </p>

              {/* Price */}
              <div className="mb-8 pb-8 border-b" style={{ borderColor: 'rgba(255, 110, 64, 0.2)' }}>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-white">$22</span>
                  <span className="text-xl text-gray-300">/domain</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-10">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-200 text-sm">50 Microsoft Partner accounts per domain</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-200 text-sm">200 emails per day per account</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-200 text-sm">100% Automated Setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-200 text-sm">24 Hour Turnaround</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-200 text-sm">SPF / DKIM / Strict DMARC</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ff6e40' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-200 text-sm">Premium 1-on-1 Support</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => setIsPopupOpen(true)}
                className="w-full rounded-xl py-3.5 font-semibold transition-all duration-300"
                style={{
                  backgroundColor: '#ff6e40',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff8c69';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 110, 64, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff6e40';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrderPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </section>
  );
};

export default PricingSection;
