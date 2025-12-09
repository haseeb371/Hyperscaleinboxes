import React, { useEffect, useRef, useState } from "react";
import { RightArrowPrimayclor } from "../SVGs/svg";

const Consultation = () => {
  const buttonRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Remove and re-add class to replay animation
          setAnimate(false);
          setTimeout(() => setAnimate(true), 50); // small delay to reset
        }
      },
      { threshold: 0.6 }
    );

    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current);
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={() =>
        window.open("https://calendly.com/voltic-inc/discovery-meeting?month=2024-03", "_blank")
      }
      className={`bg-primaryColor h-11 rounded-full flex gap-[10px] items-center transition-all duration-300 hover:shadow-[0_0_20px_6px_rgba(161,0,255,0.8)] relative overflow-hidden ${animate ? "consultationAni animate" : ""}`}
    >
      <p
        className={`text-base font-medium leading-5 text-[#F4F0FF] whitespace-nowrap ${
          animate ? "consultationText animate" : "w-0"
        }`}
      >
        Free Consultation
      </p>
      <span className="bg-white h-9 w-9 rounded-full flex justify-center items-center absolute top-1/2 -translate-y-1/2 right-1 z-10">
        <RightArrowPrimayclor width="22" height="22" />
      </span>
    </button>
  );
};

export default Consultation;
