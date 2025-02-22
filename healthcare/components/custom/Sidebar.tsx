import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="p-2 md:hidden fixed top-4 left-4 z-50 bg-white shadow-md rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {!isOpen && <Menu className="w-6 h-6 text-gray-600" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md pt-20 transition-transform duration-300 ease-in-out z-40
        ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
      >
        <nav className="mt-6">
          {isOpen && (
            <button
              className="p-2 mt-20 md:hidden absolute top-4 right-4 bg-white shadow-md rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          )}

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
          <Link
            href="/doctor/chatVerification"
            className="block py-3 px-6 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Chat Verification
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
