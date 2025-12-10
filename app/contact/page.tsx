"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingLines from "@/components/FloatingLines";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email",
      detail: "support@hyperscaleinboxes.com",
      link: "mailto:support@hyperscaleinboxes.com",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Office",
      detail: "San Francisco, CA",
      link: null,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Business Hours",
      detail: "Mon-Fri: 9AM - 6PM PST",
      link: null,
    },
  ];

  const faqs = [
    {
      question: "What is your response time?",
      answer: "We typically respond to all inquiries within 24 hours during business days.",
    },
    {
      question: "Do you offer custom solutions?",
      answer: "Yes, we provide custom enterprise solutions tailored to your specific needs.",
    },
    {
      question: "How can I schedule a demo?",
      answer: "Fill out the contact form and mention 'demo request' in your message.",
    },
  ];

  return (
    <main className="relative min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #141414 100%)" }}>
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.25) 0%, transparent 70%)' }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.2) 0%, transparent 70%)', animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 max-w-7xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 backdrop-blur-md rounded-full px-5 py-2 inline-flex items-center gap-2 mb-6 shadow-lg shadow-orange-500/10">
              <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
              <span className="text-xs font-semibold text-orange-400 tracking-wide">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
              <span className="text-white">Let&apos;s </span>
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Connect</span>
            </h1>
            <p className="text-base text-gray-400 leading-relaxed">
              Have questions about our email infrastructure? We&apos;re here to help you scale your outreach.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-16">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="backdrop-blur-xl rounded-2xl p-5 border transition-all duration-500 group relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(255, 110, 64, 0.2) 0%, rgba(255, 110, 64, 0.1) 100%)', border: '1px solid rgba(255, 110, 64, 0.3)' }}>
                    <div className="text-orange-400">{info.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">{info.title}</h3>
                    {info.link ? (
                      <a href={info.link} className="text-white hover:text-orange-400 transition-colors duration-300 text-sm font-medium">
                        {info.detail}
                      </a>
                    ) : (
                      <p className="text-white text-sm font-medium">{info.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Contact Form - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div
                className="backdrop-blur-xl rounded-2xl p-8 border relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)' }}></div>

                <h2 className="text-xl font-bold text-white mb-1 relative z-10">Send us a Message</h2>
                <p className="text-gray-400 mb-6 relative z-10 text-sm">Fill out the form and we&apos;ll get back to you shortly.</p>

              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 outline-none text-sm"
                    style={{
                      background: focusedField === "name"
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      border: focusedField === "name" ? '1px solid rgba(255, 110, 64, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 outline-none text-sm"
                    style={{
                      background: focusedField === "email"
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      border: focusedField === "email" ? '1px solid rgba(255, 110, 64, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("company")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 outline-none text-sm"
                    style={{
                      background: focusedField === "company"
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      border: focusedField === "company" ? '1px solid rgba(255, 110, 64, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-white transition-all duration-300 outline-none resize-none text-sm"
                    style={{
                      background: focusedField === "message"
                        ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      border: focusedField === "message" ? '1px solid rgba(255, 110, 64, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    placeholder="Tell us about your project..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full font-semibold text-white transition-all duration-500 flex items-center justify-center group relative overflow-hidden pl-6 pr-5 py-3 text-base gap-2"
                  style={{
                    background: 'linear-gradient(to right, #fb923c 0%, #f97316 50%, #ea580c 100%)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10">Send Message</span>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)' }}>
                    <svg className="w-5 h-5 transition-transform duration-300 rotate-[-45deg] group-hover:rotate-0" fill="none" stroke="url(#sendGradient)" viewBox="0 0 24 24" strokeWidth={2}>
                      <defs>
                        <linearGradient id="sendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="50%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                      </defs>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </form>
              </div>
            </div>

            {/* FAQ Section - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Frequently Asked</h2>
                <p className="text-gray-400 text-sm">Quick answers</p>
              </div>

              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl rounded-xl p-5 border transition-all duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderColor: 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-white mb-2">{faq.question}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{faq.answer}</p>
                  </div>
                </div>
              ))}

              {/* Social Links */}
              <div
                className="backdrop-blur-xl rounded-xl p-5 border relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="relative z-10">
                  <h3 className="text-sm font-bold text-white mb-3">Connect With Us</h3>
                  <div className="flex gap-2">
                    <a
                      href="#"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 hover:scale-110 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 hover:scale-110 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 hover:scale-110 group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
