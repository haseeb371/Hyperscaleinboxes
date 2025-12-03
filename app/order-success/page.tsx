"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}>
      <Navigation />
      
      <div className="container mx-auto px-6 lg:px-20 py-32 max-w-4xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Order Confirmed!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your order! Your payment has been successfully processed and your order is now being reviewed by our team.
          </p>

          {sessionId && (
            <div className="mb-8 p-6 rounded-xl border" style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderColor: 'rgba(255, 255, 255, 0.1)' 
            }}>
              <p className="text-sm text-gray-400 mb-2">Order ID</p>
              <p className="text-white font-mono text-sm break-all">{sessionId}</p>
              <p className="text-xs text-gray-500 mt-3">Save this Order ID to track your order status</p>
            </div>
          )}

          <div className="mb-8 p-6 rounded-xl border" style={{ 
            background: 'rgba(255, 110, 64, 0.1)', 
            borderColor: 'rgba(255, 110, 64, 0.3)' 
          }}>
            <h2 className="text-lg font-semibold text-white mb-4">What Happens Next?</h2>
            <ul className="text-left text-gray-300 space-y-3 max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">✓</span>
                <span>You'll receive an order confirmation email with all the details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">✓</span>
                <span>Our team will review your order and begin processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">✓</span>
                <span>We'll contact you within 24-48 hours to set up your email accounts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">✓</span>
                <span>Track your order progress anytime using your Order ID</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/order-form"
              className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 border flex items-center justify-center gap-2"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Place Another Order
            </Link>
            <Link
              href="/orders"
              className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(to right, #fb923c 0%, #f97316 50%, #ea580c 100%)',
                color: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 110, 64, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Check Your Order Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}>
      <Navigation />
      <div className="container mx-auto px-6 lg:px-20 py-32 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

