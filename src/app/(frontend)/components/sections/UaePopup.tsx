"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

const UaePopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const popupDismissed = localStorage.getItem("uaePopupDismissed");

    if (!popupDismissed) {
      setIsVisible(true);
    } else {
      const dismissedTime = parseInt(popupDismissed);
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
      const currentTime = new Date().getTime();

      if (currentTime - dismissedTime > threeDaysInMs) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("uaePopupDismissed", new Date().getTime().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50  backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative bg-[#0b0b0b] border border-[#B9E810]/30 rounded-2xl shadow-[0_0_20px_rgba(185,232,16,0.15)] max-w-sm w-full mx-auto animate-scale-in overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-black p-2 rounded-full border border-[#B9E810]/40 hover:bg-[#B9E810] hover:text-[#000000] transition-all duration-200 shadow-[0_0_8px_rgba(185,232,16,0.3)]"
        >
          <X className="w-4 h-4 text-[#B9E810] hover:text-[#000000]" />
        </button>

        {/* Popup Body */}
        <div className="p-6 text-center">
          {/* Title */}
          <div className="flex items-center justify-center mb-4">
            <h3 className="text-2xl font-semibold text-white">
              Hello from <span className="text-[#B9E810]">UAE</span>
            </h3>
            <Image
              src="/UAEFlag.jpg"
              alt="UAE Flag"
              width={34}
              height={34}
              className="ml-3 rounded-md"
            />
          </div>

          {/* Text */}
          <p className="text-gray-400 mb-6 text-sm">
            Welcome to{" "}
            <span className="text-[#B9E810] font-semibold">MaxFit</span> — your
            fitness journey starts here.
          </p>

          {/* Explore Button */}
          <button
            onClick={handleClose}
            className="relative w-full py-3 px-6 text-base font-semibold rounded-lg bg-[#B9E810] text-black hover:shadow-[0_0_15px_#B9E810] transition-all duration-300"
          >
            Explore MaxFit
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.35s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.35s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default UaePopup;
