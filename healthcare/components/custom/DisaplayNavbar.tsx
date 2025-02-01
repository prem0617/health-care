"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./NavBar";
import DoctorNavbar from "./DoctorNavbar";

const DisplayNavbar = () => {
  const pathname = usePathname();

  const isDoctorPath = pathname.startsWith("/doctor");

  return <div>{isDoctorPath ? <DoctorNavbar /> : <Navbar />}</div>;
};

export default DisplayNavbar;
