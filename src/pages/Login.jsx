import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_name", data.user.name);
        localStorage.setItem("user_email", formData.email);
        localStorage.setItem("user_role", data.user.role);
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (error) {
      alert("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-6xl w-full min-h-[600px]">
        <div className="md:w-1/2 bg-sky-100 flex items-center justify-center">
          <img src="/loginimg.png" alt="Login" className="h-full w-full object-cover" />
        </div>
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-center mb-8">Sign in to Water Quality Monitor</p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" required placeholder="name@company.com"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required placeholder="••••••••"
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white shadow-md transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"}`}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          <p className="text-sm text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-sky-600 font-bold hover:underline">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
