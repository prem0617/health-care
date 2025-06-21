import React from "react";
import Sidebar from "./Sidebar";

const DoctorLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto mt-20">{children}</div>
    </div>
  );
};

export default DoctorLayout;
