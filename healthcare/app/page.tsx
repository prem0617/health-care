"use client";

import HeroSecetion from "@/components/custom/HeroSecetion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const doctorToken = localStorage.getItem("doctorToken");

    if (doctorToken) {
      router.push("/doctor/dashboard");
      return;
    }
  }, []);

  return (
    <div>
      <HeroSecetion />
    </div>
  );
}
