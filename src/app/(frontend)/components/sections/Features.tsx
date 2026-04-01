"use client";

import { Brain, Utensils, TrendingUp, Mic, Archive, History } from "lucide-react";
import { Card, CardContent } from "@/app/(frontend)/components/ui/card";
import CountUp from "react-countup";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Workout Generation",
      description:
        "Smart algorithms create personalized routines based on your goals, fitness level, and available equipment.",
    },
    {
      icon: Utensils,
      title: "Meal Planning",
      description:
        "Nutritionally balanced meal suggestions tailored to your dietary preferences and fitness objectives.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Advanced analytics and insights to monitor your transformation journey with detailed metrics.",
    },
    {
      icon: Mic,
      title: "Voice Commands",
      description:
        "Hands-free workout guidance with voice-activated commands for seamless training sessions.",
    },
    {
      icon: Archive,
      title: "Plan Archives",
      description:
        "Save and revisit your favorite routines with our comprehensive workout and meal plan library.",
    },
    {
      icon: History,
      title: "Call History",
      description:
        "Track your AI interactions and progress with detailed logs of all your coaching sessions.",
    },
  ];

  return (
    <section id="features" className="py-10 sm:py-20 bg-maxfit-dark-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-6">
            Powered by{" "}
            <span className="text-[#B9E810] text-glow">
              AI Innovation
            </span>
          </h2>
          <p className="text-sm sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of fitness with cutting-edge AI technology
            that adapts to your unique needs and goals
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-gray-900/20 to-gray-800/60  border border-maxfit-neon-green/30 border-maxfit-neon-green/20 hover-lift group cursor-pointer"
            >
              <CardContent className="p-4 sm:p-8">
                <div className="mb-3 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-maxfit-neon-green/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-maxfit-neon-green/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-maxfit-neon-green" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-maxfit-neon-green transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="hidden sm:block text-sm sm:text-base text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-10 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="text-center">
            <h3 className="text-2xl sm:text-4xl font-bold text-maxfit-neon-green mb-1 sm:mb-2">
              <CountUp
                end={10000}
                duration={2.5}
                separator=","
                enableScrollSpy
                scrollSpyOnce
              />
              +
            </h3>
            <p className="text-xs sm:text-base text-gray-300">Active Users</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl sm:text-4xl font-bold text-maxfit-neon-green mb-1 sm:mb-2">
              <CountUp
                end={50000}
                duration={2.5}
                separator=","
                enableScrollSpy
                scrollSpyOnce
              />
              +
            </h3>
            <p className="text-xs sm:text-base text-gray-300">Workouts Generated</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl sm:text-4xl font-bold text-maxfit-neon-green mb-1 sm:mb-2">
              <CountUp
                end={95}
                duration={2.2}
                enableScrollSpy
                scrollSpyOnce
              />
              %
            </h3>
            <p className="text-xs sm:text-base text-gray-300">User Satisfaction</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl sm:text-4xl font-bold text-maxfit-neon-green mb-1 sm:mb-2">
              24/7
            </h3>
            <p className="text-xs sm:text-base text-gray-300">AI Support</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
