"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Submit Setup Job",
      description: "Use the API or platform to submit a domain setup job with advanced customization. Enter your sender name(s) or upload a CSV, select your redirect destination, and even pick the Cloudflare account you want to host your domains in.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      number: "02",
      title: "Update Nameservers",
      description: "We'll guide you through a quick nameserver change to connect your domain to Cloudflare. We can even write you a custom script to automate this at the registrar level and make it even more hands-off for you.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      number: "03",
      title: "Wait A Few Hours",
      description: "We'll handle all the backend provisioning including setup, Microsoft configuration, DNS, and compliance checks, typically within 1–2 hours.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      number: "04",
      title: "Download CSV & Start Sending",
      description: "Once setup is complete, you're ready to send. Download your CSV, upload to your sending platform, and start sending!",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;

    // Create a timeline for the scroll animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=300%", // 3x the section height for smooth scrolling
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          // Calculate which step should be active based on scroll progress
          const progress = self.progress;
          const stepIndex = Math.min(Math.floor(progress * steps.length), steps.length - 1);
          setActiveStep(stepIndex);
        }
      }
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section id="services" ref={sectionRef} className="relative min-h-screen" style={{ background: "linear-gradient(180deg, #0f0f0f 0%, #141414 50%, #1a1a1a 100%)" }}>
      <div className="container mx-auto px-6 lg:px-20 max-w-7xl h-screen flex flex-col justify-center py-20">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 backdrop-blur-md rounded-full px-6 py-3 inline-flex items-center gap-3 mb-8 shadow-lg shadow-orange-500/10">
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
            <span className="text-sm font-semibold text-orange-400 tracking-wide">
              How It Works
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 tracking-tight">
            <span className="font-normal text-white">Get Started in</span>{' '}
            <span className="font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">4 Simple Steps</span>
          </h2>

          {/* Enhanced Progress Indicator - Integrated with header */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="rounded-full transition-all duration-500 flex items-center justify-center font-bold text-xs"
                  style={{
                    width: activeStep === index ? '32px' : '24px',
                    height: activeStep === index ? '32px' : '24px',
                    backgroundColor: activeStep === index ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                  }}
                >
                  0{index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="w-12 h-0.5 mx-1 transition-all duration-500"
                    style={{
                      backgroundColor: activeStep > index ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center flex-1">

          {/* Left Side - Content */}
          <div className="relative" style={{ minHeight: '550px' }}>
            {steps.map((step, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  opacity: activeStep === index ? 1 : 0,
                  transform: activeStep === index ? 'translateY(0)' : 'translateY(30px)',
                  pointerEvents: activeStep === index ? 'auto' : 'none'
                }}
              >
                <div className="h-full flex flex-col justify-center relative">
                  {/* Large decorative outline number in background */}
                  <div
                    className="absolute top-1/2 left-0 transform -translate-y-1/2 pointer-events-none select-none"
                    style={{
                      fontSize: '34rem',
                      fontWeight: 'bold',
                      WebkitTextStroke: '3px rgba(255, 110, 64, 0.15)',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1,
                      zIndex: 0,
                      opacity: 0.6
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Content with higher z-index */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-8" style={{ color: '#ff6e40' }}>
                      {step.icon}
                    </div>

                    {/* Title with improved typography */}
                    <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight" style={{
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}>
                      {step.title}
                    </h3>

                    {/* Description with softer text */}
                    <p className="text-base lg:text-lg text-gray-400 leading-relaxed font-normal" style={{
                      color: '#B0B0B0'
                    }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Illustration Area with depth */}
          <div className="relative" style={{ minHeight: '550px' }}>
            <div className="sticky top-24 h-full">
              {/* Layered background with depth */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 animate-pulse"
                  style={{ backgroundColor: '#ff6e40', animationDuration: '4s' }}
                />
                <div
                  className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-15"
                  style={{ backgroundColor: '#ff6e40' }}
                />
              </div>

              {/* Main illustration container with multiple shadow layers */}
              <div
                className="relative backdrop-blur-xl rounded-3xl border h-full flex items-center justify-center p-12"
                style={{
                  background: 'linear-gradient(135deg, rgba(36, 36, 36, 0.4) 0%, rgba(20, 20, 20, 0.6) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 30px 80px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  minHeight: '550px'
                }}
              >
                {/* Enhanced grid pattern */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-[0.03]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255, 110, 64, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 110, 64, 0.8) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }}
                />

                {/* Content changes based on active step */}
                <div className="relative z-10 text-center w-full">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700"
                      style={{
                        opacity: activeStep === index ? 1 : 0,
                        transform: activeStep === index ? 'scale(1) rotateY(0deg)' : 'scale(0.85) rotateY(10deg)',
                        pointerEvents: activeStep === index ? 'auto' : 'none'
                      }}
                    >
                      {/* Icon container with enhanced design */}
                      <div
                        className="w-48 h-48 rounded-3xl mb-8 flex items-center justify-center relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 110, 64, 0.15) 0%, rgba(255, 110, 64, 0.05) 100%)',
                          border: '2px solid rgba(255, 110, 64, 0.3)',
                          boxShadow: '0 20px 40px rgba(255, 110, 64, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-60"
                          style={{
                            background: 'radial-gradient(circle at 30% 30%, rgba(255, 110, 64, 0.3) 0%, transparent 60%)'
                          }}
                        />
                        <div className="relative z-10" style={{ color: '#ff6e40' }}>
                          {React.cloneElement(step.icon as React.ReactElement<{ className?: string; strokeWidth?: number }>, { className: 'w-24 h-24', strokeWidth: 1.5 })}
                        </div>
                      </div>

                      {/* Step label with better design */}
                      <div
                        className="px-6 py-2 rounded-full font-semibold text-sm"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 110, 64, 0.2) 0%, rgba(255, 110, 64, 0.1) 100%)',
                          border: '1px solid rgba(255, 110, 64, 0.3)',
                          color: '#ff6e40',
                          boxShadow: '0 4px 12px rgba(255, 110, 64, 0.2)'
                        }}
                      >
                        Step {step.number} of 04
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
