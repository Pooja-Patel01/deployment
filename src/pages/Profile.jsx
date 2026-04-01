import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const name = localStorage.getItem("user_name");
    const email = localStorage.getItem("user_email");
    const role = localStorage.getItem("user_role");
    setUser({ name, email, role });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-sky-50 font-sans">
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map</li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📊 Reports</li>
          <li onClick={() => navigate("/water-data")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🌊 Water Data</li>
          <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🔍 Search</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">👤 Profile</li>
        </ul>
      </div>
      <div className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-sky-900">User Profile</h1>
          <p className="text-sky-600">Your account details</p>
        </header>
        {user && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-8">
              <div className="flex items-center mb-8">
                <div className="w-20 h-20 bg-sky-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-sky-900">{user.name}</h2>
                  <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-sm font-bold capitalize">{user.role}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-sky-50 rounded-xl">
                  <span className="text-gray-500 font-medium">📧 Email</span>
                  <span className="font-bold text-slate-700">{user.email}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-sky-50 rounded-xl">
                  <span className="text-gray-500 font-medium">👔 Role</span>
                  <span className="font-bold text-slate-700 capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-sky-50 rounded-xl">
                  <span className="text-gray-500 font-medium">✅ Status</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Active</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
