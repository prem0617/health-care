import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MessageCircle, User, Search, Clock, ArrowRight } from "lucide-react";

const UsersChat = () => {
  const [doctor, setDoctor] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (!token) {
      setLoading(false);
      return;
    }

    const decodedToken = jwtDecode(token);
    setDoctor(decodedToken);
    console.log(decodedToken);

    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/messages/users/${decodedToken.userId}`
        );
        console.log(res);
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (!searchTerm.trim()) return true; // Show all users if no search term

    const firstName = user?.profile?.firstName || "";
    const lastName = user?.profile?.lastName || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase().trim();
    const email = user?.email?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase().trim();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      firstName.toLowerCase().includes(searchLower) ||
      lastName.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last || "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-6 mt-[80px]">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">Your patient conversations</p>
              </div>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-medium">
                {users.length} Patients
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No patients found" : "No conversations yet"}
              </h3>
              <p className="text-gray-500 text-center">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Your patient conversations will appear here once you start chatting"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user, index) => (
                <Link
                  key={user?._id}
                  to={`/chat/${user?._id}`}
                  className="block hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {getInitials(
                            user?.profile?.firstName,
                            user?.profile?.lastName
                          )}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {user?.profile?.firstName && user?.profile?.lastName
                              ? `${user.profile.firstName} ${user.profile.lastName}`
                              : "Unknown Patient"}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Patient
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {user?.email || "No email provided"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            Last active recently
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 ml-4">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-6"></div>
    </div>
  );
};

export default UsersChat;
