"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/(frontend)/components/ui/button";
import {
  Play,
  X,
  Phone,
  ShoppingBag,
  Maximize2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import User1 from "@/app/(frontend)/assets/User/user1.png";
import User2 from "@/app/(frontend)/assets/User/user2.png";
import User3 from "@/app/(frontend)/assets/User/user3.png";
import User4 from "@/app/(frontend)/assets/User/user4.png";
import { useAuth } from "../../context/AuthProvider";


const Hero = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [calories, setCalories] = useState(342);
  const [heartRate, setHeartRate] = useState(128);
  const [workoutProgress, setWorkoutProgress] = useState(75);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const calorieInterval = setInterval(() => {
      setCalories((prev) => {
        const newVal = prev + Math.floor(Math.random() * 3);
        return newVal > 450 ? 342 : newVal;
      });
    }, 2000);
    return () => clearInterval(calorieInterval);
  }, []);

  useEffect(() => {
    const heartInterval = setInterval(() => {
      setHeartRate((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + change;
        return newVal < 120 ? 120 : newVal > 135 ? 135 : newVal;
      });
    }, 1500);
    return () => clearInterval(heartInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setWorkoutProgress((prev) => {
        const newVal = prev + 1;
        return newVal > 100 ? 75 : newVal;
      });
    }, 3000);
    return () => clearInterval(progressInterval);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const closeFullscreen = () => {
    setShowVideoModal(false);
  };

  const openFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      }
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/MaxFitBG.png"
          alt="AI-Powered Fitness"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maxfit-black via-maxfit-black/60 to-maxfit-black/30"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-10 md:pt-0 flex items-center h-screen  ">
        {/* Two-column layout: left = content, right = video */}
        <div className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16">

          {/* ── LEFT: Text Content ── */}
          <div
            className={`flex-1 text-center lg:text-left space-y-5 sm:space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight">
              <span className="text-white block">Transform</span>
              <span className="text-white block">Your Full Body</span>
              <span className="text-[#B9E810] block bg-gradient-to-r from-[#B9E810] to-[#9BC908] bg-clip-text text-glow text-transparent">
                With MaxFit AI
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Personalized workout plans, meal recommendations, and real-time
              coaching powered by advanced AI technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center">
              <Link href={user ? "/dashboard/maxi-ai" : "/signup"} className="w-full sm:w-auto">
                <Button className="btn-neon cursor-pointer font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:brightness-110 shadow-2xl shadow-[#B9E810]/40 hover:shadow-[#B9E810]/60 w-full sm:w-auto">
                  <span className="flex items-center justify-center">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-black" />
                    {user ? "Talk with Maxi AI" : "Start Your Free Trial"}
                  </span>
                </Button>
              </Link>

              <Link href="https://shop.maxfitai.com" target="_blank" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="btn-outline-neon cursor-pointer text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 flex items-center justify-center hover:scale-105 w-full sm:w-auto rounded-xl border-2 transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mr-2 transition-transform" />
                  Visit Shop
                </Button>
              </Link>
            </div>


          </div>

          {/* ── RIGHT: Embedded Video ── */}
          <div
            className={`flex-1 w-full lg:max-w-[520px] xl:max-w-[580px] transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
              }`}
          >

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#B9E810]/20 shadow-2xl shadow-[#B9E810]/10">
              {/* Glow ring */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#B9E810]/30 via-transparent to-[#B9E810]/10 pointer-events-none z-10"></div>

              <video
                ref={videoRef}
                src="/MaxFitAI.mp4"
                title="MaxFit Demo Video"
                muted
                loop
                playsInline
                controls
                className="w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 text-gray-400 mt-4">
              <div className="flex -space-x-2">
                {[User1, User2, User3, User4].map((userImg, i) => (
                  <div
                    key={i}
                    className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#B9E810]/30 hover:scale-110 transition-transform shadow-lg"
                  >
                    <Image
                      src={userImg}
                      alt={`User ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-white font-semibold text-sm sm:text-base">
                10,000+ fitness enthusiasts joined
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Full-screen Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <button
            onClick={closeFullscreen}
            className="absolute top-6 right-6 sm:top-10 sm:right-10 text-white hover:text-[#BBE810] transition z-50"
            aria-label="Close video"
          >
            <X size={36} />
          </button>
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-[#BBE810]/20">
            <video
              ref={modalVideoRef}
              width="100%"
              height="100%"
              src="/MaxFitAI.mp4"
              title="MaxFit Demo Video"
              autoPlay
              loop
              controls
              className="rounded-2xl object-cover w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}


    </section>

  );
};

export default Hero;