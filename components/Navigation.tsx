"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GetStartedButton from "./GetStartedButton";
import OrderPopup from "./OrderPopup";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "How It Works", path: "/#services" },
    { label: "Pricing", path: "/#pricing" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
      <div className="max-w-6xl w-full mx-6 transition-all duration-500 rounded-full backdrop-blur-xl shadow-2xl border" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        <div className="flex items-center justify-between h-16 px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center p-1.5 rounded-lg transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-orange-500/10 group-hover:to-orange-600/5">
              <img 
                src="/logo-icon.svg" 
                alt="HyperScaleInboxes" 
                className="h-7 w-7 transition-all duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent tracking-tight">
              HyperScale
            </span>
          </Link>

          {/* Navigation Menu - Desktop */}
          <div className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className="font-semibold text-gray-300 hover:text-orange-400 transition-all duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex">
              <GetStartedButton size="small" onClick={() => setIsPopupOpen(true)} />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-orange-400 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-6 backdrop-blur-xl border rounded-3xl shadow-2xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}>
            <div className="flex flex-col py-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-3 text-left font-semibold text-gray-300 hover:text-orange-400 hover:bg-white/5 transition-all duration-300"
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-6 py-3">
                <GetStartedButton size="small" className="w-full justify-center" onClick={() => setIsPopupOpen(true)} />
              </div>
            </div>
          </div>
        )}
      </div>

      <OrderPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </nav>
  );
};

export default Navigation;
