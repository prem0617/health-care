"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  UserPlus,
  Calendar,
  MessageCircle,
  Activity,
  Shield,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";

import Spline from "@splinetool/react-spline";

export default function HeroSection() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="relative  w-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-purple-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-pink-300 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Spline 3D object */}
      <div className="absolute inset-0 z-10 opacity-30">
        <Spline scene="https://prod.spline.design/a0n4hVRRBOD5URVY/scene.splinecode" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20">
        <div className="container mx-auto px-4 py-20">
          <motion.h1
            className="text-center mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl md:text-6xl"
            {...fadeInUp}
          >
            Your All-in-One <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Health Management Platform
            </span>
          </motion.h1>

          <motion.p
            className="text-center mb-8 text-xl text-gray-600 max-w-3xl mx-auto"
            {...fadeInUp}
          >
            Experience the future of healthcare with our AI-powered platform.
            Connect with top doctors, track your health, and receive
            personalized care - all in one secure, easy-to-use system.
          </motion.p>

          <motion.div
            className="flex justify-center space-x-4 mb-12"
            {...fadeInUp}
          >
            <Link href={localStorage.getItem("token") ? "/booking" : "/auth"}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg transition-all hover:from-blue-700 hover:to-purple-700"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Get Doctor
              </Button>
            </Link>
            {/* <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-400 text-blue-700 text-lg hover:bg-blue-50"
            >
              <Stethoscope className="mr-2 h-5 w-5" />
              Explore Features
            </Button> */}
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: Calendar,
                title: "Easy Scheduling",
                description: "Book appointments with just a few clicks",
              },
              {
                icon: MessageCircle,
                title: "24/7 Doctor Chat",
                description: "Get instant medical advice anytime",
              },
              {
                icon: Activity,
                title: "Health Tracking",
                description: "Monitor your vitals and progress",
              },
              {
                icon: Shield,
                title: "AI-Powered Insights",
                description: "Receive personalized health recommendations",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 text-center">
            <motion.h2
              className="text-3xl font-bold mb-8 text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Trusted by Thousands
            </motion.h2>
            <div className="flex justify-center space-x-12">
              {[
                { icon: UserPlus, value: "10k+", label: "Active Users" },
                { icon: Stethoscope, value: "500+", label: "Expert Doctors" },
                { icon: Clock, value: "24/7", label: "Support" },
                { icon: Award, value: "99%", label: "Satisfaction Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <stat.icon className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </span>
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
