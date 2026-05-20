import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/api/auth/signup", formData);

      navigate("/verify-otp", {
        state: {
          email: response.data.email,
          testOtp: response.data.test_otp,
        },
      });
    } catch (error) {
      setMessage(error.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-900 text-center">
          Create Account
        </h1>

        <p className="text-slate-600 text-center mt-2">
          Signup first, verify OTP, then login to your portal.
        </p>

        {message && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ayushman Singh"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Minimum 6 characters"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Signup & Generate OTP"}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-6">
          Already verified?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;