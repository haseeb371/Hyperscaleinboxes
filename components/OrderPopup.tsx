"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface OrderPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderPopup = ({ isOpen, onClose }: OrderPopupProps) => {
  const router = useRouter();

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBookMeeting = () => {
    window.open('https://calendly.com/taylor-jones-hyperscaleinboxes/30min?month=2025-11', '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handlePlaceOrder = () => {
    router.push('/order-form');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      style={{ willChange: 'opacity' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        className="relative max-w-2xl w-full rounded-3xl p-10 border shadow-2xl animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          willChange: 'transform, opacity',
          transform: 'translate3d(0, 0, 0)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Glow Effect - Simplified for performance */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)', filter: 'blur(40px)' }}></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            willChange: 'transform',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Let's Get{' '}
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Started
              </span>
            </h2>
            <p className="text-lg text-gray-300">
              Choose how you'd like to proceed
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Book a Meeting Option */}
            <button
              onClick={handleBookMeeting}
              className="rounded-2xl p-8 border transition-all duration-300 group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 110, 64, 0.15) 0%, rgba(255, 110, 64, 0.05) 100%)';
                e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.4)';
                e.currentTarget.style.transform = 'translate3d(0, -4px, 0)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translate3d(0, 0, 0)';
              }}
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-transform duration-200 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(255, 110, 64, 0.2) 0%, rgba(255, 110, 64, 0.1) 100%)', willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}>
                  <svg className="w-8 h-8" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Book a Meeting</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Schedule a call with our team to discuss your specific needs and get personalized guidance.
                </p>
              </div>
            </button>

            {/* Place Order Option */}
            <button
              onClick={handlePlaceOrder}
              className="rounded-2xl p-8 border transition-all duration-300 group relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 110, 64, 0.15) 0%, rgba(255, 110, 64, 0.05) 100%)',
                borderColor: 'rgba(255, 110, 64, 0.3)',
                willChange: 'transform',
                transform: 'translate3d(0, 0, 0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 110, 64, 0.25) 0%, rgba(255, 110, 64, 0.1) 100%)';
                e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                e.currentTarget.style.transform = 'translate3d(0, -4px, 0)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 110, 64, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 110, 64, 0.15) 0%, rgba(255, 110, 64, 0.05) 100%)';
                e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.3)';
                e.currentTarget.style.transform = 'translate3d(0, 0, 0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-transform duration-200 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)', willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Place Order</h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Ready to go? Fill out our order form and we'll get you set up within 24 hours.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale3d(0.95, 0.95, 1);
          }
          to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.15s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderPopup;
