"use client";

interface GetStartedButtonProps {
  className?: string;
  size?: "default" | "small";
  onClick?: () => void;
}

const GetStartedButton = ({ className = "", size = "default", onClick }: GetStartedButtonProps) => {
  const sizeClasses = size === "small"
    ? "pl-5 pr-4 py-2 text-base gap-2"
    : "pl-7 pr-6 py-3 text-xl gap-3";

  const circleSize = size === "small" ? "w-7 h-7" : "w-10 h-10";
  const iconSize = size === "small" ? "w-3.5 h-3.5" : "w-5 h-5";

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-full font-semibold text-white transition-all duration-500 flex items-center group relative overflow-hidden ${sizeClasses} ${className}`}
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
      <span className="relative z-10">Get Started</span>
      <div className={`${circleSize} rounded-full flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)' }}>
        <svg className={`${iconSize} transition-transform duration-300 rotate-[-45deg] group-hover:rotate-0`} fill="none" stroke="url(#arrowGradient)" viewBox="0 0 24 24" strokeWidth={2}>
          <defs>
            <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default GetStartedButton;
