"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingLines from "@/components/FloatingLines";
import { useEffect, useState, useRef, useCallback } from "react";

export default function About() {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    cards: false,
    stats: false,
    values: false,
    timeline: false,
    team: false,
    cta: false,
  });

  const [counts, setCounts] = useState({
    clients: 0,
    emails: 0,
    uptime: 0,
  });

  const timelineRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: 500, suffix: "+", label: "Active Clients", key: "clients" },
    { value: 10, suffix: "M+", label: "Emails Delivered Daily", key: "emails" },
    { value: 99.9, suffix: "%", label: "Uptime Guarantee", key: "uptime" },
    { value: "24/7", label: "Expert Support", key: "support" },
  ];

  const values = [
    {
      title: "Unlimited Capacity",
      description:
        "True unlimited email capacity through 50 Microsoft Partner accounts per domain. Infrastructure built to scale with your business growth seamlessly.",
      icon: "server",
    },
    {
      title: "Transparent Pricing",
      description:
        "Simple $10-12 per domain pricing with no hidden fees or setup charges. Predictable costs that scale with your business needs.",
      icon: "document",
    },
    {
      title: "Enterprise Grade",
      description:
        "SPF, DKIM, DMARC configuration with Microsoft Partner infrastructure. Maximum inbox placement and sender reputation protection.",
      icon: "shield",
    },
    {
      title: "Expert Support",
      description:
        "24/7 dedicated support team ensuring your email infrastructure performs flawlessly. We&apos;re here to help you succeed every step.",
      icon: "handshake",
    },
  ];

  const timeline = [
    {
      year: "2020",
      title: "Company Founded",
      description:
        "Started with a vision to democratize enterprise email infrastructure for businesses of all sizes",
    },
    {
      year: "2021",
      title: "Microsoft Partnership",
      description:
        "Partnered with Microsoft to deliver enterprise-grade solutions with unlimited scalability",
    },
    {
      year: "2022",
      title: "Major Milestone",
      description:
        "Reached 100+ active clients and 1M daily emails with industry-leading deliverability",
    },
    {
      year: "2023",
      title: "Rapid Growth",
      description:
        "Expanded to 500+ clients with 10M+ daily email capacity and enhanced features",
    },
    {
      year: "2024",
      title: "Innovation Leader",
      description:
        "Launched advanced deliverability optimization and became the industry standard",
    },
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "15+ years in email infrastructure and SaaS solutions. Led teams at Microsoft and built enterprise email systems from the ground up.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Former Microsoft Azure architect. Expert in scalable cloud infrastructure and email deliverability optimization.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Customer Success",
      bio: "Passionate about customer satisfaction. 10+ years helping businesses scale their email operations successfully.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    },
    {
      name: "David Kumar",
      role: "Lead Engineer",
      bio: "Specializes in email automation and Microsoft Partner infrastructure. Built systems handling billions of emails.",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
    },
  ];

  const animateCount = useCallback((key: string, target: number, duration: number) => {
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCounts((prev) => ({ ...prev, [key]: current }));
    }, stepDuration);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target.getAttribute("data-section");
          if (section) {
            setIsVisible((prev) => ({ ...prev, [section]: true }));

            // Trigger counting animation for stats
            if (section === "stats") {
              animateCount("clients", 500, 1500);
              animateCount("emails", 10, 1500);
              animateCount("uptime", 99.9, 1500);
            }
          }
        }
      });
    }, observerOptions);

    document.querySelectorAll("[data-section]").forEach((el) => {
      observer.observe(el);
    });

    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      setIsVisible((prev) => ({ ...prev, hero: true }));
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [animateCount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f]">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #141414 100%)", minHeight: "700px" }}
      >
        {/* FloatingLines Background */}
        <div className="absolute inset-0 opacity-60">
<FloatingLines
  linesGradient={['#ff6e40', '#ff8c69', '#ff6e40']}
  lineCount={12}
  lineDistance={12}
  wavePosition={{ x: 5.0, y: 0.0, rotate: 0.2 }}
  animationSpeed={0.8}
  mixBlendMode="screen"
/>
        </div>

        {/* Gradient Overlay for Depth */}
        <div
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(255, 110, 64, 0.08) 0%, rgba(10, 10, 10, 0.4) 100%)" }}
        ></div>

        <div
          className="container mx-auto px-6 lg:px-20 relative z-10 flex items-center justify-center"
          style={{ minHeight: "700px" }}
        >
          <div
            className={`max-w-5xl mx-auto text-center transition-all duration-1200 ease-out ${
              isVisible.hero
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-16 scale-95"
            }`}
          >
            <div className="mb-8 inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-lg shadow-orange-500/20">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
              <span className="font-semibold tracking-wide text-sm">About Us</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-[1.15] tracking-tight">
              <span className="text-white">Delivering </span>
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Excellence</span>
              <span className="text-white"> in Email Infrastructure</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto font-light tracking-wide">
              We&apos;re on a mission to help businesses worldwide achieve unlimited
              email capacity through innovative Microsoft Partner solutions
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision & More Cards */}
      <section
        className="py-24 relative"
        style={{ background: "linear-gradient(180deg, #141414 0%, #0f0f0f 100%)" }}
        data-section="cards"
      >
        <div className="container mx-auto px-6 lg:px-20 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Mission */}
            <div
              className={`relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 group overflow-hidden h-full flex flex-col shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${
                isVisible.cards
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
              <h2 className="text-2xl font-bold mb-4 relative z-10">
                <span className="text-white tracking-tight">Our </span>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Mission</span>
              </h2>
              <p className="text-gray-300 leading-relaxed flex-grow relative z-10 text-[15px]">
                To empower businesses with reliable, unlimited email
                infrastructure that guarantees inbox delivery through Microsoft
                Partner accounts.
              </p>
            </div>

            {/* Vision */}
            <div
              className={`relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 group overflow-hidden h-full flex flex-col shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${
                isVisible.cards
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
              <h2 className="text-2xl font-bold mb-4 relative z-10">
                <span className="text-white tracking-tight">Our </span>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Vision</span>
              </h2>
              <p className="text-gray-300 leading-relaxed flex-grow relative z-10 text-[15px]">
                To become the world&apos;s most trusted email infrastructure
                provider, enabling businesses to scale without limits while we
                handle deliverability.
              </p>
            </div>

            {/* Commitment */}
            <div
              className={`relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 group overflow-hidden h-full flex flex-col shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${
                isVisible.cards
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-20"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
              <h2 className="text-2xl font-bold mb-4 relative z-10">
                <span className="text-white tracking-tight">Our </span>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Commitment</span>
              </h2>
              <p className="text-gray-300 leading-relaxed flex-grow relative z-10 text-[15px]">
                Dedicated to providing exceptional service. From setup to
                optimization, we ensure your email infrastructure performs at
                its best every day.
              </p>
            </div>

            {/* Why Choose Us */}
            <div
              className={`relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 group overflow-hidden h-full flex flex-col shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${
                isVisible.cards
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
              <h2 className="text-2xl font-bold mb-4 relative z-10">
                <span className="text-white tracking-tight">Why </span>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Choose Us</span>
              </h2>
              <p className="text-gray-300 leading-relaxed flex-grow relative z-10 text-[15px]">
                Unlimited capacity with Microsoft Partner infrastructure. 500+
                satisfied clients achieving maximum deliverability at
                transparent prices.
              </p>
            </div>

            {/* Our Approach */}
            <div
              className={`relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 group overflow-hidden h-full flex flex-col shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${
                isVisible.cards
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
              <h2 className="text-2xl font-bold mb-4 relative z-10">
                <span className="text-white tracking-tight">Our </span>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Approach</span>
              </h2>
              <p className="text-gray-300 leading-relaxed flex-grow relative z-10 text-[15px]">
                Combining cutting-edge Microsoft technology with personalized
                service. Every solution is tailored with proactive monitoring
                and expert optimization.
              </p>
            </div>

            {/* Global Reach */}
            <div
              className={`relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 group overflow-hidden h-full flex flex-col shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 ${
                isVisible.cards
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-20"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <div
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
              <h2 className="text-2xl font-bold mb-4 relative z-10">
                <span className="text-white tracking-tight">Global </span>
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Reach</span>
              </h2>
              <p className="text-gray-300 leading-relaxed flex-grow relative z-10 text-[15px]">
                Serving clients worldwide with 24/7 support. Our global
                infrastructure ensures fast, reliable delivery across all
                regions and time zones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        className="py-24 relative"
        style={{ background: "linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)" }}
        data-section="stats"
      >
        <div className="container mx-auto px-6 lg:px-20 max-w-7xl">
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 transition-all duration-1000 ${
              isVisible.stats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-500 text-center group overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-25 transition-all duration-700 blur-3xl"
                  style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <h3
                  className="text-5xl lg:text-6xl font-bold mb-3 relative z-10 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent"
                >
                  {typeof stat.value === "number"
                    ? stat.key === "clients"
                      ? Math.floor(counts.clients)
                      : stat.key === "emails"
                      ? Math.floor(counts.emails)
                      : stat.key === "uptime"
                      ? counts.uptime.toFixed(1)
                      : stat.value
                    : stat.value}
                  {typeof stat.value === "number" && stat.suffix}
                </h3>
                <p className="text-gray-300 font-medium text-sm lg:text-base relative z-10">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        className="py-28 relative"
        style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 50%, #141414 100%)" }}
        data-section="values"
      >
        <div className="container mx-auto px-6 lg:px-20 max-w-7xl">
          <div
            className={`text-center mb-20 transition-all duration-1200 ease-out ${
              isVisible.values
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <div className="mb-8 inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 px-6 py-3 rounded-full backdrop-blur-md shadow-lg shadow-orange-500/10">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
              <span className="font-semibold text-orange-400 tracking-wide text-sm">Our Values</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              <span className="text-white">What </span>
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Drives Us Forward</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed font-light">
              Our core values guide everything we do and shape how we serve our
              clients
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 transition-all duration-1000 ${
              isVisible.values
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {values.map((value, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 text-center group overflow-hidden h-full flex flex-col hover:-translate-y-2 shadow-2xl hover:shadow-orange-500/10"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className="absolute -top-24 -right-24 w-52 h-52 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                  style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 110, 64, 0.15) 0%, rgba(255, 110, 64, 0.05) 100%)",
                    border: "2px solid rgba(255, 110, 64, 0.3)",
                    boxShadow: "0 8px 32px rgba(255, 110, 64, 0.15)"
                  }}
                >
                  {value.icon === "server" && (
                    <svg className="w-10 h-10 text-orange-500 group-hover:text-orange-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  )}
                  {value.icon === "document" && (
                    <svg className="w-10 h-10 text-orange-500 group-hover:text-orange-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {value.icon === "shield" && (
                    <svg className="w-10 h-10 text-orange-500 group-hover:text-orange-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {value.icon === "handshake" && (
                    <svg className="w-10 h-10 text-orange-500 group-hover:text-orange-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 relative z-10 tracking-tight">
                  {value.title}
                </h3>
                <p className="text-gray-300 text-[15px] leading-relaxed flex-grow relative z-10">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section
        className="py-28 relative"
        style={{ background: "linear-gradient(180deg, #141414 0%, #0f0f0f 50%, #1a1a1a 100%)" }}
        data-section="timeline"
      >
        <div className="container mx-auto px-6 lg:px-20 max-w-6xl">
          <div
            className={`text-center mb-20 transition-all duration-1200 ease-out ${
              isVisible.timeline
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <div className="mb-8 inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 px-6 py-3 rounded-full backdrop-blur-md shadow-lg shadow-orange-500/10">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
              <span className="font-semibold text-orange-400 tracking-wide text-sm">Our Journey</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              <span className="text-white">Growing Together </span>
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Since 2020</span>
            </h2>
          </div>

          <div className="relative" ref={timelineRef}>
            {/* Timeline Line for Mobile */}
            <div
              className="absolute left-7 top-0 w-1 h-full lg:hidden"
              style={{ background: "linear-gradient(180deg, rgba(255, 110, 64, 0.3) 0%, rgba(255, 110, 64, 0.1) 100%)" }}
            ></div>

            {/* Timeline Line for Desktop */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-1 h-full hidden lg:block"
              style={{ background: "linear-gradient(180deg, rgba(255, 110, 64, 0.3) 0%, rgba(255, 110, 64, 0.1) 100%)" }}
            ></div>

            <div className="space-y-10 lg:space-y-16">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-8 lg:gap-12 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  } ${
                    isVisible.timeline
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    transitionDelay: `${index * 150}ms`,
                    transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Mobile Timeline Dot */}
                  <div
                    className="lg:hidden flex w-10 h-10 rounded-full flex-shrink-0 items-center justify-center relative z-10 mt-1 shadow-lg shadow-orange-500/30"
                    style={{
                      background: "linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)",
                      border: "3px solid rgba(255, 110, 64, 0.3)"
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-inner" />
                  </div>

                  <div
                    className={`flex-1 ${
                      index % 2 === 0 ? "lg:text-right" : "lg:text-left"
                    }`}
                  >
                    <div className="group bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/[0.08] hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-700 relative overflow-hidden hover:-translate-y-1">
                      <div
                        className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-15 transition-all duration-700 blur-3xl"
                        style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
                      ></div>
                      <div
                        className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent relative z-10"
                      >
                        {item.year}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3 relative z-10 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-[15px] relative z-10">{item.description}</p>
                    </div>
                  </div>

                  {/* Desktop Timeline Dot */}
                  <div
                    className="hidden lg:flex w-14 h-14 rounded-full flex-shrink-0 items-center justify-center relative z-10 shadow-xl shadow-orange-500/30 group-hover:scale-110 transition-transform duration-500"
                    style={{
                      background: "linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)",
                      border: "4px solid rgba(255, 110, 64, 0.3)"
                    }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white shadow-inner" />
                  </div>

                  <div className="flex-1 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        className="py-28 relative"
        style={{ background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)" }}
        data-section="team"
      >
        <div className="container mx-auto px-6 lg:px-20 max-w-7xl">
          <div
            className={`text-center mb-20 transition-all duration-1200 ease-out ${
              isVisible.team
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-12 scale-95"
            }`}
          >
            <div className="mb-8 inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 px-6 py-3 rounded-full backdrop-blur-md shadow-lg shadow-orange-500/10">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
              <span className="font-semibold text-orange-400 tracking-wide text-sm">Our Team</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
              <span className="text-white">Meet the People Behind </span>
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">HyperScale Inboxes</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed font-light">
              Our experienced team is dedicated to delivering exceptional email
              infrastructure solutions
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 transition-all duration-1000 ${
              isVisible.team
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {team.map((member, index) => (
              <div
                key={index}
                className="relative bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-white/[0.08] hover:border-orange-500/40 transition-all duration-700 group overflow-hidden hover:-translate-y-2 shadow-2xl hover:shadow-orange-500/10"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className="absolute -top-24 -right-24 w-52 h-52 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 blur-3xl"
                  style={{ background: "radial-gradient(circle, #ff6e40 0%, transparent 70%)" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="mb-6 overflow-hidden rounded-2xl ring-2 ring-white/5 group-hover:ring-orange-500/30 transition-all duration-500">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                    {member.name}
                  </h3>
                  <p
                    className="text-sm font-semibold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"
                  >
                    {member.role}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
