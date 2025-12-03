"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";

interface AccountName {
  firstName: string;
  lastName: string;
  email: string;
}

export default function OrderFormPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    website: "",
    packageType: "full",
    numberOfDomains: "1",
    // BYOD fields
    customDomains: [] as string[],
    dnsProvider: "",
    providerEmail: "",
    providerPassword: "",
    // Full Package fields
    searchedDomains: [] as { domain: string; available: boolean }[],
    selectedDomains: [] as string[],
    additionalRequirements: "",
  });

  const [domainSearchQuery, setDomainSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [accountNames, setAccountNames] = useState<AccountName[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seedFirstName, setSeedFirstName] = useState("");
  const [seedLastName, setSeedLastName] = useState("");

  // Calculate total accounts needed (50 per domain)
  const totalAccountsNeeded = parseInt(formData.numberOfDomains) * 50;

  // Initialize account names array when domains change
  const initializeAccountNames = (forceReset: boolean = false) => {
    const needed = totalAccountsNeeded;
    const current = accountNames.length;
    
    if (needed === 0) {
      // Reset if no domains
      setAccountNames([]);
      return;
    }
    
    // If forcing reset or count changed, create fresh array
    if (forceReset || needed !== current) {
      const newAccounts = Array(needed).fill(null).map(() => ({
        firstName: "",
        lastName: "",
        email: "",
      }));
      setAccountNames(newAccounts);
    } else if (current === 0 && needed > 0) {
      // Initialize if empty
      const newAccounts = Array(needed).fill(null).map(() => ({
        firstName: "",
        lastName: "",
        email: "",
      }));
      setAccountNames(newAccounts);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Initialize arrays when domain count or package type changes
    if (name === "numberOfDomains") {
      const newNumberOfDomains = parseInt(value) || 1;
      
      // Update customDomains immediately if BYOD is selected
      if (formData.packageType === 'byod') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          customDomains: Array(newNumberOfDomains).fill(""),
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      
      // Initialize account names
      setTimeout(() => {
        initializeAccountNames();
      }, 0);
    }
    
    // Clear domain selections when package type changes
    if (name === "packageType") {
      const newPackageType = value as 'byod' | 'full';
      const numberOfDomains = parseInt(formData.numberOfDomains) || 1;
      
      setFormData(prev => {
        const updated = { 
          ...prev, 
          customDomains: [] as string[],
          selectedDomains: [],
          searchedDomains: [],
          packageType: newPackageType,
        };
        
        // If switching to BYOD, initialize custom domains array immediately
        if (newPackageType === 'byod') {
          updated.customDomains = Array(numberOfDomains).fill("") as string[];
        }
        
        return updated;
      });
      
      // Reset account names when package type changes
      setTimeout(() => {
        setAccountNames([]);
        initializeAccountNames();
      }, 0);
    }
  };

  // Initialize custom domains array when number changes
  const initializeCustomDomains = () => {
    const needed = parseInt(formData.numberOfDomains);
    const current = formData.customDomains.length;
    
    if (needed > current) {
      const newDomains = Array(needed - current).fill("");
      setFormData(prev => ({ ...prev, customDomains: [...prev.customDomains, ...newDomains] }));
    } else if (needed < current) {
      setFormData(prev => ({ ...prev, customDomains: prev.customDomains.slice(0, needed) }));
    }
  };

  // Real domain availability checker using DNS lookup
  const searchDomainAvailability = async (query: string) => {
    setIsSearching(true);
    
    try {
      // Check if user already provided a full domain (contains a dot and common extension)
      const commonExtensions = ['.com', '.net', '.org', '.io', '.co', '.ai', '.app', '.dev'];
      const hasExtension = commonExtensions.some(ext => query.toLowerCase().endsWith(ext));
      
      const results: { domain: string; available: boolean }[] = [];
      
      if (hasExtension) {
        // Check for subdomains (e.g., voltic.ai.com) which are not registerable
        // Allow 2 parts (example.com) or 3 parts for specific ccTLDs (example.co.uk)
        const parts = query.split('.');
        const isMultipartTLD = query.endsWith('.co.uk') || query.endsWith('.com.au') || query.endsWith('.co.jp');
        const isValidFormat = parts.length === 2 || (parts.length === 3 && isMultipartTLD);

        if (!isValidFormat) {
          // Invalid format (likely a subdomain), mark as unavailable
          results.push({ domain: query, available: false });
          
          // Generate suggestions from the root name
          const rootName = parts[0];
          results.push(
            { domain: `${rootName}.com`, available: true },
            { domain: `${rootName}.ai`, available: true },
            { domain: `${rootName}.io`, available: true },
          );
        } else {
          // User provided full domain, search only that
          try {
            const response = await fetch(`https://dns.google/resolve?name=${query}&type=A`);
            const data = await response.json();
            const isAvailable = data.Status === 3;
            results.push({ domain: query, available: isAvailable });
            
            // Add suggestions with different extensions
            if (!isAvailable) {
              const rootName = query.split('.')[0];
              results.push(
                { domain: `${rootName}.net`, available: true },
                { domain: `${rootName}.org`, available: true },
                { domain: `${rootName}.io`, available: true },
              );
            }
          } catch (error) {
            results.push({ domain: query, available: true });
          }
        }
      } else {
        // User provided search term, check multiple extensions
        const extensions = ['.com', '.net', '.org', '.io', '.co'];
        
        for (const ext of extensions) {
          const domain = `${query}${ext}`;
          
          try {
            const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
            const data = await response.json();
            const isAvailable = data.Status === 3;
            results.push({ domain, available: isAvailable });
          } catch (error) {
            results.push({ domain, available: true });
          }
        }
        
        // Add more suggestions if primary .com is taken
        if (results[0] && !results[0].available) {
          results.push(
            { domain: `${query}online.com`, available: true },
            { domain: `get${query}.com`, available: true },
            { domain: `${query}pro.com`, available: true },
          );
        }
      }
      
      setFormData(prev => ({ ...prev, searchedDomains: results }));
    } catch (error) {
      console.error('Domain search error:', error);
      alert('Failed to check domain availability. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDomainSearch = () => {
    if (domainSearchQuery.trim()) {
      searchDomainAvailability(domainSearchQuery.trim());
      setDomainSearchQuery(""); // Clear search after initiating search
    }
  };

  const toggleDomainSelection = (domain: string) => {
    const maxDomains = parseInt(formData.numberOfDomains);
    setFormData(prev => {
      const isSelected = prev.selectedDomains.includes(domain);
      let newSelected;
      
      if (isSelected) {
        newSelected = prev.selectedDomains.filter(d => d !== domain);
      } else if (prev.selectedDomains.length < maxDomains) {
        newSelected = [...prev.selectedDomains, domain];
      } else {
        return prev; // Don't add if limit reached
      }
      
      return { ...prev, selectedDomains: newSelected };
    });
    // Domain change will be detected by useEffect and accounts will be reset
  };

  const removeDomainFromSelection = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDomains: prev.selectedDomains.filter(d => d !== domain)
    }));
    // Domain change will be detected by useEffect and accounts will be reset
  };

  const handleCustomDomainChange = (index: number, value: string) => {
    const updated = [...formData.customDomains];
    updated[index] = value;
    setFormData(prev => ({ ...prev, customDomains: updated }));
    // Domain change will be detected by useEffect and accounts will be reset
  };

  const handleAccountNameChange = (index: number, field: keyof AccountName, value: string) => {
    const updated = [...accountNames];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-generate email if First or Last name changes
    if (field === 'firstName' || field === 'lastName') {
      const firstName = field === 'firstName' ? value : updated[index].firstName;
      const lastName = field === 'lastName' ? value : updated[index].lastName;

      if (firstName && lastName) {
        // Sanitize names: lowercase, remove special chars
        const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Generate random 3-digit suffix
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        
        updated[index].email = `${cleanFirst}.${cleanLast}.${randomSuffix}`;
      }
    }

    setAccountNames(updated);
  };

  const generateAccounts = () => {
    if (!seedFirstName.trim() || !seedLastName.trim()) {
      return;
    }

    const firstName = seedFirstName.trim();
    const lastName = seedLastName.trim();
    
    // Clean names for email generation (lowercase, remove special chars)
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const firstInitial = cleanFirst.charAt(0);
    const lastInitial = cleanLast.charAt(0);
    
    // Professional email patterns - generate function for each pattern
    const generateEmailPattern = (index: number): string => {
      const num = index + 1;
      const randomNum = Math.floor(Math.random() * 999) + 1;
      const randomNum2 = Math.floor(Math.random() * 99) + 1;
      const year = new Date().getFullYear();
      
      const patterns = [
        // Standard professional patterns
        `${cleanFirst}.${cleanLast}`,
        `${cleanFirst}${cleanLast}`,
        `${firstInitial}.${cleanLast}`,
        `${cleanFirst}.${lastInitial}`,
        `${firstInitial}${cleanLast}`,
        `${cleanFirst}${lastInitial}`,
        
        // With numbers (professional)
        `${cleanFirst}.${cleanLast}${num}`,
        `${cleanFirst}${cleanLast}${num}`,
        `${firstInitial}.${cleanLast}${num}`,
        `${cleanFirst}.${cleanLast}.${num}`,
        `${cleanFirst}${num}${cleanLast}`,
        
        // With random numbers
        `${cleanFirst}.${cleanLast}${randomNum}`,
        `${cleanFirst}${cleanLast}${randomNum}`,
        `${firstInitial}${cleanLast}${randomNum}`,
        
        // Department/role patterns
        `${cleanFirst}.${cleanLast}.sales`,
        `${cleanFirst}.${cleanLast}.support`,
        `${cleanFirst}.${cleanLast}.admin`,
        `${cleanFirst}.sales`,
        `${cleanFirst}.support`,
        `${cleanFirst}.info`,
        `sales.${cleanLast}`,
        `support.${cleanLast}`,
        `info.${cleanLast}`,
        
        // With separators
        `${cleanFirst}_${cleanLast}`,
        `${cleanFirst}-${cleanLast}`,
        `${firstInitial}_${cleanLast}`,
        `${cleanFirst}_${lastInitial}`,
        
        // With year
        `${cleanFirst}.${cleanLast}${year}`,
        `${cleanFirst}${year}`,
        `${firstInitial}.${cleanLast}${year}`,
        
        // More variations
        `${cleanFirst}${cleanLast}${randomNum2}`,
        `${firstInitial}${cleanLast}${randomNum2}`,
        `${cleanFirst}.${cleanLast}.${randomNum2}`,
        `${cleanFirst}${lastInitial}${num}`,
        `${firstInitial}${cleanLast}${firstInitial}`,
      ];
      
      return patterns[index % patterns.length];
    };

    // Generate account names
    const totalNeeded = totalAccountsNeeded;
    const updatedAccounts: AccountName[] = [];
    
    for (let i = 0; i < totalNeeded; i++) {
      // Keep base names for most accounts, add slight variations occasionally
      let varFirstName = firstName;
      let varLastName = lastName;
      
      // Occasionally add variations to names (every 10th account)
      if (i > 0 && i % 10 === 0) {
        const variationNum = Math.floor(i / 10);
        if (variationNum % 2 === 0) {
          varFirstName = `${firstName} ${variationNum}`;
        } else {
          varLastName = `${lastName} ${variationNum}`;
        }
      }
      
      const email = generateEmailPattern(i);
      
      updatedAccounts.push({
        firstName: varFirstName,
        lastName: varLastName,
        email: email,
      });
    }

    setAccountNames(updatedAccounts);
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }

    if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    }

    if (step === 3) {
      const numDomains = parseInt(formData.numberOfDomains);
      
      if (formData.packageType === "byod") {
        // Validate BYOD fields
        const filledDomains = formData.customDomains.filter(d => d.trim());
        if (filledDomains.length < numDomains) {
          newErrors.customDomains = `Please enter all ${numDomains} domain name(s)`;
        }
        if (!formData.dnsProvider) {
          newErrors.dnsProvider = "Please select your DNS provider";
        }
        if (!formData.providerEmail.trim()) {
          newErrors.providerEmail = "Provider email/username is required";
        }
        if (!formData.providerPassword.trim()) {
          newErrors.providerPassword = "Provider password is required";
        }
      } else {
        // Validate Full Package fields
        if (formData.selectedDomains.length < numDomains) {
          newErrors.selectedDomains = `Please select ${numDomains} domain(s)`;
        }
      }
    }

    if (step === 4) {
      // Validate at least some account names are filled
      const filledAccounts = accountNames.filter(acc => acc.firstName.trim() || acc.lastName.trim() || acc.email.trim());
      if (filledAccounts.length === 0) {
        newErrors.accountNames = "Please provide at least one account name or email";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        initializeAccountNames();
      }
      if (currentStep === 2) {
        // Initialize domain arrays when entering step 3
        initializeCustomDomains();
      }
      if (currentStep === 4) {
        // Ensure account names are initialized when entering step 5
        if (accountNames.length === 0) {
          initializeAccountNames();
        }
      }
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build full email (username@domain) for each account before sending to backend
      const displayDomain = getDisplayDomain();
      const transformedAccountNames = accountNames.map((acc) => {
        let email = acc.email || '';

        // If user only entered the username part, append the domain
        if (email && !email.includes('@')) {
          email = `${email}@${displayDomain}`;
        }

        return {
          ...acc,
          email,
        };
      });

      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          accountNames: transformedAccountNames,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Error: ${error.message || 'Failed to process payment. Please try again.'}`);
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  // Get the actual domain(s) to display in step 4
  const getDisplayDomain = (): string => {
    if (formData.packageType === 'byod' && formData.customDomains.length > 0) {
      const firstDomain = formData.customDomains[0].trim();
      if (firstDomain) {
        return firstDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
    } else if (formData.selectedDomains.length > 0) {
      return formData.selectedDomains[0];
    }
    return 'yourdomain.com';
  };

  // Ensure account names are initialized when entering step 4
  useEffect(() => {
    if (currentStep === 4 && accountNames.length === 0 && totalAccountsNeeded > 0) {
      initializeAccountNames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Track previous domain key to detect actual domain changes
  const prevDomainKeyRef = useRef<string>('');

  // Reset account names when domains actually change (not just count)
  useEffect(() => {
    if (currentStep === 4) {
      // Only reset if we're on step 4 (where accounts are displayed)
      const domainKey = formData.packageType === 'byod' 
        ? formData.customDomains.join(',')
        : formData.selectedDomains.join(',');
      
      if (prevDomainKeyRef.current !== domainKey && prevDomainKeyRef.current !== '') {
        // Domain changed, reset accounts completely
        initializeAccountNames(true);
      }
      prevDomainKeyRef.current = domainKey;
    } else if (currentStep < 4) {
      // Reset the ref when not on step 4 so we can detect changes when entering step 4
      prevDomainKeyRef.current = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.customDomains, formData.selectedDomains, formData.packageType, currentStep]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}>
      <Navigation />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden opacity-40 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.25) 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: 'radial-gradient(circle, rgba(255, 110, 64, 0.2) 0%, transparent 70%)' }}></div>
      </div>

      <div className="container mx-auto px-6 lg:px-20 py-32 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 backdrop-blur-md rounded-full px-6 py-3 inline-flex items-center gap-3 mb-8 shadow-lg shadow-orange-500/10">
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-lg shadow-orange-500/50"></span>
            <span className="text-sm font-semibold text-orange-400 tracking-wide">Step {currentStep} of {totalSteps}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            <span className="font-normal">Place Your</span>{' '}
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              Order
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 font-light">
            {currentStep === 1 && "Let's start with your basic information"}
            {currentStep === 2 && "Tell us about your company"}
            {currentStep === 3 && "Choose your package"}
            {currentStep === 4 && "Provide account names"}
            {currentStep === 5 && "Any additional requirements?"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <div 
              className="h-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(to right, #fb923c 0%, #f97316 50%, #ea580c 100%)',
              }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background: step <= currentStep 
                      ? 'linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: step <= currentStep ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                    transform: step === currentStep ? 'scale(1.2)' : 'scale(1)',
                  }}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div
          className="rounded-3xl p-10 lg:p-12 border relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Glow Effect */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #ff6e40 0%, transparent 70%)' }}></div>

          <form onSubmit={handleSubmit} className="relative z-10">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Basic Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.name ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      onFocus={(e) => {
                        if (!errors.name) {
                          e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.name) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                    />
                    {errors.name && <p className="text-orange-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.email ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      onFocus={(e) => {
                        if (!errors.email) {
                          e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.email) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                    />
                    {errors.email && <p className="text-orange-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.phone ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      onFocus={(e) => {
                        if (!errors.phone) {
                          e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.phone) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                    />
                    {errors.phone && <p className="text-orange-400 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company Information */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-semibold text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: errors.companyName ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      onFocus={(e) => {
                        if (!errors.companyName) {
                          e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.companyName) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                    />
                    {errors.companyName && <p className="text-orange-400 text-sm mt-1">{errors.companyName}</p>}
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-semibold text-gray-300 mb-2">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Order Details & Domain Configuration */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Package & Domain Configuration
                </h2>
                
                {/* Package Selection */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="packageType" className="block text-sm font-semibold text-gray-300 mb-2">
                      Package Type *
                    </label>
                    <select
                      id="packageType"
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                      style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        borderColor: 'rgba(75, 85, 99, 1)',
                        color: '#e5e7eb',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <option value="byod" className="bg-[#020617] text-white">Bring Your Own Domain - $10/domain</option>
                      <option value="full" className="bg-[#020617] text-white">Full Package - $22/domain</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="numberOfDomains" className="block text-sm font-semibold text-gray-300 mb-2">
                      Number of Domains *
                    </label>
                    <input
                      type="number"
                      id="numberOfDomains"
                      name="numberOfDomains"
                      value={formData.numberOfDomains}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    />
                  </div>
                </div>

                {/* Conditional Domain Configuration */}
                <div className="mt-8 p-6 rounded-2xl border" style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 110, 64, 0.2)' }}>
                  {formData.packageType === "byod" ? (
                    // BYOD: Custom Domains + Provider Credentials
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Your Domain Names
                      </h3>

                      {errors.customDomains && <p className="text-orange-400 text-sm">{errors.customDomains}</p>}

                      <div className="space-y-3">
                        {formData.customDomains.map((domain, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm font-semibold w-8">#{index + 1}</span>
                            <input
                              type="text"
                              value={domain}
                              onChange={(e) => handleCustomDomainChange(index, e.target.value)}
                              placeholder="example.com"
                              className="flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderColor: errors.customDomains ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                              }}
                              onFocus={(e) => {
                                if (!errors.customDomains) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }
                              }}
                              onBlur={(e) => {
                                if (!errors.customDomains) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          DNS Provider Credentials
                        </h3>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label htmlFor="dnsProvider" className="block text-sm font-semibold text-gray-300 mb-2">
                              Provider *
                            </label>
                            <select
                              id="dnsProvider"
                              name="dnsProvider"
                              value={formData.dnsProvider}
                              onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                              style={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              borderColor: errors.dnsProvider ? '#ff6e40' : 'rgba(75, 85, 99, 1)',
                              color: '#e5e7eb',
                              }}
                              onFocus={(e) => {
                                if (!errors.dnsProvider) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }
                              }}
                              onBlur={(e) => {
                                if (!errors.dnsProvider) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                              }}
                            >
                              <option value="" className="bg-[#020617] text-white">Select Provider</option>
                              <option value="cloudflare" className="bg-[#020617] text-white">Cloudflare</option>
                              <option value="godaddy" className="bg-[#020617] text-white">GoDaddy</option>
                              <option value="namecheap" className="bg-[#020617] text-white">Namecheap</option>
                              <option value="route53" className="bg-[#020617] text-white">AWS Route 53</option>
                              <option value="other" className="bg-[#020617] text-white">Other</option>
                            </select>
                            {errors.dnsProvider && <p className="text-orange-400 text-sm mt-1">{errors.dnsProvider}</p>}
                          </div>

                          <div>
                            <label htmlFor="providerEmail" className="block text-sm font-semibold text-gray-300 mb-2">
                              Email/Username *
                            </label>
                            <input
                              type="text"
                              id="providerEmail"
                              name="providerEmail"
                              value={formData.providerEmail}
                              onChange={handleInputChange}
                              placeholder="account@example.com"
                              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderColor: errors.providerEmail ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                              }}
                              onFocus={(e) => {
                                if (!errors.providerEmail) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }
                              }}
                              onBlur={(e) => {
                                if (!errors.providerEmail) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                              }}
                            />
                            {errors.providerEmail && <p className="text-orange-400 text-sm mt-1">{errors.providerEmail}</p>}
                          </div>

                          <div>
                            <label htmlFor="providerPassword" className="block text-sm font-semibold text-gray-300 mb-2">
                              Password *
                            </label>
                            <input
                              type="password"
                              id="providerPassword"
                              name="providerPassword"
                              value={formData.providerPassword}
                              onChange={handleInputChange}
                              placeholder="••••••••"
                              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderColor: errors.providerPassword ? '#ff6e40' : 'rgba(255, 255, 255, 0.1)',
                              }}
                              onFocus={(e) => {
                                if (!errors.providerPassword) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }
                              }}
                              onBlur={(e) => {
                                if (!errors.providerPassword) {
                                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                              }}
                            />
                            {errors.providerPassword && <p className="text-orange-400 text-sm mt-1">{errors.providerPassword}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Full Package: Domain Search & Selection
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search & Select Domains
                        <span className="text-sm font-normal text-gray-400">
                          ({formData.selectedDomains.length}/{formData.numberOfDomains} selected)
                        </span>
                      </h3>

                      {errors.selectedDomains && <p className="text-orange-400 text-sm">{errors.selectedDomains}</p>}

                      {/* Selected Domains List */}
                      {formData.selectedDomains.length > 0 && (
                        <div className="p-4 rounded-xl border" style={{ background: 'rgba(255, 110, 64, 0.1)', borderColor: 'rgba(255, 110, 64, 0.3)' }}>
                          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Selected Domains ({formData.selectedDomains.length}/{formData.numberOfDomains})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedDomains.map((domain) => (
                              <div
                                key={domain}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 group"
                                style={{
                                  background: 'rgba(255, 110, 64, 0.2)',
                                  borderColor: 'rgba(255, 110, 64, 0.4)',
                                }}
                              >
                                <span className="text-white text-sm font-semibold">{domain}</span>
                                <button
                                  type="button"
                                  onClick={() => removeDomainFromSelection(domain)}
                                  className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200"
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                  }}
                                >
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Domain Search */}
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={domainSearchQuery}
                          onChange={(e) => setDomainSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleDomainSearch()}
                          placeholder="Enter domain name (e.g., mybusiness)"
                          className="flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleDomainSearch}
                          disabled={isSearching || !domainSearchQuery.trim()}
                          className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                          style={{
                            background: isSearching || !domainSearchQuery.trim() 
                              ? 'rgba(255, 110, 64, 0.3)' 
                              : 'linear-gradient(to right, #fb923c 0%, #f97316 50%, #ea580c 100%)',
                            color: '#fff',
                            cursor: isSearching || !domainSearchQuery.trim() ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isSearching ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Searching...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              Search
                            </>
                          )}
                        </button>
                      </div>

                      {/* Search Results */}
                      {formData.searchedDomains.length > 0 && (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {formData.searchedDomains.map((result) => {
                            const isSelected = formData.selectedDomains.includes(result.domain);
                            const canSelect = isSelected || formData.selectedDomains.length < parseInt(formData.numberOfDomains);
                            
                            return (
                              <div
                                key={result.domain}
                                onClick={() => result.available && canSelect && toggleDomainSelection(result.domain)}
                                className="flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer"
                                style={{
                                  background: isSelected 
                                    ? 'rgba(255, 110, 64, 0.15)'
                                    : 'rgba(255, 255, 255, 0.03)',
                                  borderColor: isSelected 
                                    ? 'rgba(255, 110, 64, 0.5)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                  opacity: result.available && canSelect ? 1 : 0.5,
                                  cursor: result.available && canSelect ? 'pointer' : 'not-allowed',
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{
                                    borderColor: isSelected ? '#ff6e40' : 'rgba(255, 255, 255, 0.3)', background: isSelected ? '#ff6e40' : 'transparent'
                                  }}>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="text-white font-semibold">{result.domain}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {result.available ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
                                      ✓ Available
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                      ✗ Unavailable
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255, 110, 64, 0.1)', borderLeft: '4px solid #ff6e40' }}>
                  <p className="text-gray-300 text-sm">
                    <strong className="text-orange-400">Note:</strong> You'll get 50 email accounts per domain. In the next step, you'll provide account details for these inboxes.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Account Names */}
            {currentStep === 4 && (() => {
              const displayDomain = getDisplayDomain();

              return (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Account Information
                  <span className="text-sm font-normal text-gray-400">({totalAccountsNeeded} accounts total)</span>
                </h2>

                {/* Seed Name Generator */}
                <div className="mb-8 p-6 rounded-xl border" style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Auto-Generate Accounts (Optional)
                  </label>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={seedFirstName}
                        onChange={(e) => setSeedFirstName(e.target.value)}
                        placeholder="Enter first name (e.g., John)"
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={seedLastName}
                        onChange={(e) => setSeedLastName(e.target.value)}
                        placeholder="Enter last name (e.g., Smith)"
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={generateAccounts}
                      disabled={!seedFirstName.trim() || !seedLastName.trim()}
                      className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                      style={{
                        background: (seedFirstName.trim() && seedLastName.trim()) 
                          ? 'linear-gradient(to right, #fb923c 0%, #f97316 50%, #ea580c 100%)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        color: (seedFirstName.trim() && seedLastName.trim()) ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                        cursor: (seedFirstName.trim() && seedLastName.trim()) ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Generate Accounts
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter first and last name to automatically generate {totalAccountsNeeded} professional email variations (e.g., john.smith, j.smith, johnsmith123). You can still edit them below.
                  </p>
                </div>

                {errors.accountNames && (
                  <p className="text-orange-400 text-sm mb-4">{errors.accountNames}</p>
                )}

                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {accountNames.map((account, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-1">
                        <span className="text-gray-400 text-sm font-semibold">#{index + 1}</span>
                      </div>
                      
                      {/* First Name */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={account.firstName}
                          onChange={(e) => handleAccountNameChange(index, 'firstName', e.target.value)}
                          placeholder="First Name"
                          className="w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none text-white text-sm placeholder-gray-500"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                        />
                      </div>

                      {/* Last Name */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={account.lastName}
                          onChange={(e) => handleAccountNameChange(index, 'lastName', e.target.value)}
                          placeholder="Last Name"
                          className="w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none text-white text-sm placeholder-gray-500"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                        />
                      </div>

                      {/* Email (Editable) */}
                      <div className="col-span-5">
                        <div className="relative">
                          <input
                            type="text"
                            value={account.email}
                            onChange={(e) => handleAccountNameChange(index, 'email', e.target.value)}
                            placeholder="username"
                            className="w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none text-white text-sm placeholder-gray-500"
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                            @{displayDomain}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}

            {/* Step 5: Additional Requirements */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6" style={{ color: '#ff6e40' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Additional Requirements
                </h2>
                
                <div>
                  <label htmlFor="additionalRequirements" className="block text-sm font-semibold text-gray-300 mb-2">
                    Tell us more about your needs (Optional)
                  </label>
                  <textarea
                    id="additionalRequirements"
                    name="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Any specific requirements, questions, or special requests..."
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white placeholder-gray-500 resize-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 110, 64, 0.5)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 mt-8 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 border flex items-center gap-2"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 group"
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
                  Next Step
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 group"
                  style={{
                    background: isSubmitting 
                      ? 'rgba(255, 110, 64, 0.5)' 
                      : 'linear-gradient(to right, #fb923c 0%, #f97316 50%, #ea580c 100%)',
                    color: '#fff',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 110, 64, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Order
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 110, 64, 0.5);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 110, 64, 0.7);
        }
      `}</style>
    </div>
  );
}
