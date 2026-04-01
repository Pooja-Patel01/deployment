import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "citizen", // Default role
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Passwords
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration Successful!");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Server Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-5xl w-full">
        <div className="hidden md:flex md:w-1/2 bg-sky-100 items-center justify-center">
          <img src="/loginimg.png" alt="Hero" className="h-full w-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
            <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Join as:</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none bg-white">
                <option value="citizen">Citizen</option>
                <option value="ngo">NGO</option>
                <option value="authority">Authority</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm Password" 
              required 
              onChange={handleChange} 
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
            />

            <button type="submit" className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 shadow-md transition-all">
              Create Account
            </button>
          </form>
          <p className="text-sm text-center mt-6 text-gray-600">
            Already have an account? <Link to="/" className="text-sky-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
