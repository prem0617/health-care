// components/Sidebar.tsx

import Link from "next/link";
import { User, Activity, Users, FileText } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md pt-20">
      <nav className="mt-6">
        <Link
          href="/doctor/dashboard"
          className="block py-3 px-6 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/doctor/transactions"
          className="block py-3 px-6 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          Transaction
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
