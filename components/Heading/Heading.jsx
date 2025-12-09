"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Consultation from "../Consultation/page";

const Heading = ({
  title,
  description,
  buttonLink = "https://calendly.com/voltic-inc/discovery-meeting?month=2024-03",
}) => {
  const headingRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // Force animation restart

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimationKey((prevKey) => prevKey + 1); // Force re-render to restart animation
        }
      },
      { threshold: 0.2 }
    );

    if (headingRef.current) {
      observer.observe(headingRef.current);
    }

    return () => {
      if (headingRef.current) {
        observer.unobserve(headingRef.current);
      }
    };
  }, []);

  return (
    <section ref={headingRef} className="w-full h-auto">
      <div className="container mx-auto h-auto flex justify-between items-start flex-col lg:flex-row gap-7 lg:gap-0">
        <h2
          data-aos="fade-down"
          data-aos-offset="0"
          className="font-bold text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] leading-[33.6px] sm:leading-[43.2px] md:leading-[52.8px] lg:leading-[62.4px] uppercase text-white"
        >
          {title || "Heading"}
        </h2>
        <div className="grid gap-3">
          <div
            data-aos="fade-down"
            className="w-auto lg:w-[503.83px] pr-[25px] relative"
          >
            <p className="font-normal text-base sm:text-lg md:text-xl leading-6 sm:leading-6 md:leading-7 text-white">
              {description ||
                "From custom software to innovative applications, we empower businesses with technology that creates impact."}
            </p>
            <span
              key={animationKey} // Ensures animation restarts every time component enters view
              className="absolute right-0 top-0 w-[5px] h-0 bg-[#A100FF] animate-[borderGrow_1.5s_ease-in-out_forwards]"
            ></span>
          </div>
          <div className="flex justify-start items-center">
            <Consultation />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Heading;

// "use client";
// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";
// import Consultation from "../Consultation/page";

// const Heading = ({
//   title,
//   description,
//   buttonLink = "https://calendly.com/voltic-ai",
// }) => {
//   const headingRef = useRef(null);
//   const [isVisible, setIsVisible] = useState(false);
//   const [animationKey, setAnimationKey] = useState(0); // Force animation restart

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setAnimationKey((prevKey) => prevKey + 1); // Force re-render to restart animation
//         }
//       },
//       { threshold: 0.2 }
//     );

//     if (headingRef.current) {
//       observer.observe(headingRef.current);
//     }

//     return () => {
//       if (headingRef.current) {
//         observer.unobserve(headingRef.current);
//       }
//     };
//   }, []);

//   return (
//     <section ref={headingRef} className="w-full h-auto">
//       <div className="container mx-auto h-auto flex justify-between items-start flex-col lg:flex-row gap-7 lg:gap-0">
//         <h2
//           data-aos="fade-down"
//           data-aos-offset="0"
//           className="font-bold text-[7vw] sm:text-[40px] md:text-[52px] lg:text-[52px] xl:text-[52px]  md:leading-[62.4px] uppercase text-white"
//         >
//           {title || "Heading"}
//         </h2>
//         <div className="grid gap-3">
//           <div
//             data-aos="fade-down"
//             className="w-auto lg:w-[503.83px] pr-[25px] relative"
//           >
//             <p className="font-normal text-xl leading-7 text-white">
//               {description ||
//                 "From custom software to innovative applications, we empower businesses with technology that creates impact."}
//             </p>
//             <span
//               key={animationKey} // Ensures animation restarts every time component enters view
//               className="absolute right-0 top-0 w-[5px] h-0 bg-[#A100FF] animate-[borderGrow_1.5s_ease-in-out_forwards]"
//             ></span>
//           </div>
//           <div className="flex justify-start items-center">
//           <Consultation />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Heading;
