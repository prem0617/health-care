"use client";

import HeroSecetion from "@/components/custom/HeroSecetion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string>();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const doctorToken = localStorage.getItem("doctorToken");

    if (doctorToken) {
      router.push("/doctor/dashboard");
      return;
    }

    if (token) {
      setToken(token);
    }
  }, []);

  return (
    <div>
      <HeroSecetion />
    </div>
  );
}
