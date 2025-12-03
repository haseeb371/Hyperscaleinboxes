"use client";

import React from "react";

const ComparisonSection = () => {
  const features = [
    {
      name: "Price per Domain",
      hyperscale: "$10",
      inboxing: "$40",
      hypertide: "$50",
      scaledmail: "Custom"
    },
    {
      name: "Accounts per Domain",
      hyperscale: "50",
      inboxing: "49",
      hypertide: "50",
      scaledmail: "49"
    },
    {
      name: "Emails per Day",
      hyperscale: "2-5/account",
      inboxing: "2-5/account",
      hypertide: "2/account",
      scaledmail: "15/account"
    },
    {
      name: "Setup Time",
      hyperscale: "10-12 hours",
      inboxing: "1-2 hours",
      hypertide: "4-6 hours",
      scaledmail: "4 days"
    },
    {
      name: "Setup Fees",
      hyperscale: "Free",
      inboxing: "Free",
      hypertide: true,
      scaledmail: false
    },
    {
      name: "Automation",
      hyperscale: "Partial",
      inboxing: "Fully Automated",
      hypertide: "Fully Automated",
      scaledmail: "Partial"
    },
    {
      name: "Infrastructure",
      hyperscale: "Microsoft Partner",
      inboxing: "Enterprise-Grade",
      hypertide: "Azure Servers",
      scaledmail: "Isolated Tenants"
    },
    {
      name: "Support",
      hyperscale: "Premium",
      inboxing: "24/7 Chat",
      hypertide: "Email Only",
      scaledmail: "White-Glove"
    }
  ];

  return (
    <section id="comparison" className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #141414 0%, #0f0f0f 50%, #1a1a1a 100%)" }}>
      <div className="container mx-auto px-6 lg:px-20 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 backdrop-blur-md rounded-full px-6 py-3 inline-flex items-center gap-3 mb-8 shadow-lg shadow-orange-500/10">
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
            <span className="text-sm font-semibold text-orange-400 tracking-wide">Comparison</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 tracking-tight">
            <span className="font-normal text-white">See How We</span>{' '}
            <span className="font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Stack Up</span>
          </h2>
          <p className="text-xl text-gray-300 font-light">
            Compare our features and pricing with leading competitors
          </p>
        </div>

        {/* Comparison Table - Mobile Optimized */}
        <div className="overflow-x-auto -mx-6 lg:mx-0">
          <div className="inline-block min-w-full px-6 lg:px-0 align-middle">
            <div className="overflow-hidden rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-700" style={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)'
            }}>
              <table className="min-w-full">
                <thead>
                  <tr style={{
                    backgroundColor: '#2a2a2e',
                    borderBottom: '3px solid #ff6e40',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}>
                    <th className="px-4 lg:px-6 py-8 text-left text-sm lg:text-base font-bold sticky left-0" style={{
                      backgroundColor: '#2a2a2e',
                      color: '#ffffff',
                      borderBottom: '3px solid #ff6e40',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span className="tracking-wide">Feature</span>
                    </th>
                    <th className="px-4 lg:px-6 py-8 text-center text-sm lg:text-base font-bold relative min-w-[160px]" style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <div className="relative z-10">
                        <div className="font-extrabold text-lg" style={{ color: '#ffffff' }}>HyperScale</div>
                      </div>
                    </th>
                    <th className="px-4 lg:px-6 py-8 text-center text-sm lg:text-base font-bold min-w-[120px]" style={{
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span className="tracking-wide">Inboxing</span>
                    </th>
                    <th className="px-4 lg:px-6 py-8 text-center text-sm lg:text-base font-bold min-w-[120px]" style={{
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span className="tracking-wide">Hypertide</span>
                    </th>
                    <th className="px-4 lg:px-6 py-8 text-center text-sm lg:text-base font-bold min-w-[120px]" style={{
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span className="tracking-wide">ScaledMail</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => {
                    // Special handling for "Total Daily Capacity" row
                    const isCapacityRow = feature.name === "Total Daily Capacity";

                    return (
                      <tr
                        key={index}
                        className="border-t transition-all duration-300 hover:bg-white/5 group"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: 'rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        <td className="px-4 lg:px-6 py-5 text-xs lg:text-sm font-semibold sticky left-0 transition-colors duration-300" style={{
                          backgroundColor: 'transparent',
                          color: '#e8e8e8'
                        }}>
                          <span className="tracking-wide">{feature.name}</span>
                        </td>
                        <td className="px-4 lg:px-6 py-5 text-center relative">
                          {typeof feature.hyperscale === 'boolean' ? (
                            feature.hyperscale ? (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full relative z-10 shadow-md transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                                border: '2px solid rgba(128, 128, 128, 0.4)'
                              }}>
                                <svg className="w-5 h-5" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full relative z-10 shadow-sm transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(127, 127, 127, 0.1)',
                                border: '2px solid rgba(127, 127, 127, 0.2)'
                              }}>
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )
                          ) : isCapacityRow ? (
                            <span className="text-xl lg:text-2xl font-extrabold relative z-10 inline-block" style={{
                              color: '#ff6e40',
                              textShadow: '0 0 30px rgba(255, 110, 64, 0.3)'
                            }}>
                              {feature.hyperscale}
                            </span>
                          ) : (
                            <span className="text-xs lg:text-sm font-semibold relative z-10 inline-block" style={{
                              color: '#ff6e40'
                            }}>
                              {feature.hyperscale}
                            </span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-5 text-center">
                          {typeof feature.inboxing === 'boolean' ? (
                            feature.inboxing ? (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                                border: '2px solid rgba(128, 128, 128, 0.4)'
                              }}>
                                <svg className="w-5 h-5" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(100, 100, 100, 0.1)',
                                border: '2px solid rgba(100, 100, 100, 0.2)'
                              }}>
                                <svg className="w-5 h-5" style={{ color: '#808080' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )
                          ) : isCapacityRow ? (
                            <span className="text-base lg:text-lg font-bold" style={{ color: '#ffffff' }}>
                              {feature.inboxing}
                            </span>
                          ) : (
                            <span className="text-xs lg:text-sm font-medium tracking-wide" style={{ color: '#ffffff' }}>{feature.inboxing}</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-5 text-center">
                          {typeof feature.hypertide === 'boolean' ? (
                            feature.hypertide ? (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                                border: '2px solid rgba(128, 128, 128, 0.4)'
                              }}>
                                <svg className="w-5 h-5" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(100, 100, 100, 0.1)',
                                border: '2px solid rgba(100, 100, 100, 0.2)'
                              }}>
                                <svg className="w-5 h-5" style={{ color: '#808080' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )
                          ) : isCapacityRow ? (
                            <span className="text-base lg:text-lg font-bold" style={{ color: '#ffffff' }}>
                              {feature.hypertide}
                            </span>
                          ) : (
                            <span className="text-xs lg:text-sm font-medium tracking-wide" style={{ color: '#ffffff' }}>{feature.hypertide}</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-5 text-center">
                          {typeof feature.scaledmail === 'boolean' ? (
                            feature.scaledmail ? (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                                border: '2px solid rgba(128, 128, 128, 0.4)'
                              }}>
                                <svg className="w-5 h-5" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110" style={{
                                backgroundColor: 'rgba(100, 100, 100, 0.1)',
                                border: '2px solid rgba(100, 100, 100, 0.2)'
                              }}>
                                <svg className="w-5 h-5" style={{ color: '#808080' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            )
                          ) : isCapacityRow ? (
                            <span className="text-base lg:text-lg font-bold" style={{ color: '#ffffff' }}>
                              {feature.scaledmail}
                            </span>
                          ) : (
                            <span className="text-xs lg:text-sm font-medium tracking-wide" style={{ color: '#ffffff' }}>{feature.scaledmail}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
