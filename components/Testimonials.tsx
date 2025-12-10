"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Heading from "@/components/Heading/Heading";
import Image from "next/image";
import { UnMute, Mute } from "@/asserts/Exporting/asserts";

interface Client {
  id: number;
  name: string;
  videoSrc: string;
}

const clients: Client[] = [
  // { id: 1, name: "KAREEM",      videoSrc: "/videos/Kareem Testimonial.mp4" },
  { id: 2, name: "FELIPE",      videoSrc: "/videos/Filipe Testimonial.mp4" },
  { id: 3, name: "DANIEL",      videoSrc: "/videos/Daniel Tegnender.mp4" },
  { id: 4, name: "CHRISTIAN",   videoSrc: "/videos/christianeicho.mp4" },
  { id: 5, name: "ROY",         videoSrc: "/videos/roytesti.mp4" },
  { id: 6, name: "TIFFANY",     videoSrc: "/videos/Tiffany Potter (3).mp4" },
  // { id: 7, name: "TYLER",       videoSrc: "/videos/tyler mudrock - testimonial.mp4" },
];

const Reviews = () => {
  const [activeIndex, setActiveIndex] = useState(3);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const playActiveVideo = useCallback(() => {
    const video = videoRefs.current[activeIndex];
    if (video && isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    }
  }, [activeIndex, isPlaying]);

  const pauseAllVideos = useCallback(() => {
    videoRefs.current.forEach(v => v?.pause());
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => e.isIntersecting ? playActiveVideo() : (pauseAllVideos(), setIsPlaying(false)),
      { threshold: 0.6 }
    );
    sectionRef.current && observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [playActiveVideo, pauseAllVideos]);

  useEffect(() => {
    pauseAllVideos();
    isPlaying && playActiveVideo();
  }, [activeIndex]);

  const handleCardClick = (i: number) => {
    setActiveIndex(i);
    setIsPlaying(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(v => !v);
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[activeIndex];
    if (video) {
      isPlaying ? video.pause() : video.play();
      setIsPlaying(v => !v);
    }
  };

  return (
    <section ref={sectionRef} className="container mx-auto py-16 md:py-24 lg:py-32">

      {/* Full container */}
      <div className="relative mt-16 overflow-hidden p-8">
        <div className="flex h-[500px] items-center justify-center md:h-[680px] lg:h-[780px]">
          <div className="flex items-center justify-center gap-4 px-8 md:gap-6">
            {clients.map((client, i) => {
              const isActive = i === activeIndex;
              const distance = Math.abs(i - activeIndex);

              // Active card: fixed large width
              // Inactive: small width, but visible
              const width = isActive
                ? "420px"   // ← All active videos have SAME WIDTH
                : distance === 1
                ? "100px"
                : distance === 2
                ? "80px"
                : "60px";

              return (
                <div
                  key={client.id}
                  onClick={() => handleCardClick(i)}
                  className={`
                    relative cursor-pointer overflow-hidden rounded-2xl  text-white transition-all duration-500 ease-out
                    ${isActive 
                      ? "ring-4 ring-white/50  shadow-2xl z-30 scale-105" 
                      : "opacity-65 hover:opacity-90 z-10"
                    }
                  `}
                  style={{
                    width,
                    minWidth: width,
                    height: "100%",
                  }}
                >
                  {isActive ? (
                    <div className="relative h-full w-full">
                      <video
                        ref={(el) => {
  videoRefs.current[i] = el;
}}
                        src={client.videoSrc}
                        className="h-full w-full object-cover"
                        muted={isMuted}
                        loop
                        playsInline
                        preload="metadata"
                      />

                      <button
                        onClick={toggleMute}
                        className="absolute right-4 top-4 rounded-full bg-black/70 p-4 backdrop-blur-sm hover:bg-black/90"
                      >
                        <Image src={isMuted ? Mute : UnMute} alt="Sound" width={36} height={36} />
                      </button>

                      {!isPlaying && (
                        <button
                          onClick={togglePlayPause}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur"
                        >
                          <svg className="h-24 w-24 md:h-32 md:w-32 text-white" fill="currentColor" viewBox="0 0 384 512">
                            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-[350px] w-full items-center justify-center bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white">
                      <span
                        className="rotate-180 font-bold tracking-widest text-white/60 [writing-mode:vertical-rl]"
                        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                      >
                        <span className="text-2xl md:text-4xl lg:text-5xl">{client.name}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;