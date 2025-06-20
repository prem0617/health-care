import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSecetion";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const doctorToken = localStorage.getItem("doctorToken");
    if (doctorToken) {
      navigate("/doctor/dashboard");
    }
  }, [navigate]);

  return (
    <div>
      <HeroSection />
    </div>
  );
};

export default Home;
