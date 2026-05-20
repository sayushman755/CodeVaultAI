import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";
  const testOtpFromState = location.state?.testOtp || "";

  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [testOtp, setTestOtp] = useState(testOtpFromState);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/api/auth/verify-otp", {
        email,
        otp,
      });

      setMessage(response.data.message || "OTP verified successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.detail || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email first.");
      return;
    }

    setResending(true);
    setMessage("");

    try {
      const response = await API.post("/api/auth/resend-otp", {
        email,
      });

      setTestOtp(response.data.test_otp || "");
      setMessage(response.data.message || "OTP regenerated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-slate-900 text-center">
          Verify OTP
        </h1>

        <p className="text-slate-600 text-center mt-2">
          Enter the OTP generated after signup to activate your account.
        </p>

        {testOtp && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
            <p className="font-semibold">Development OTP:</p>
            <p className="text-3xl font-bold tracking-widest mt-1">{testOtp}</p>
            <p className="text-xs mt-2">
              This is only for local testing. Later, this OTP can be sent by email.
            </p>
          </div>
        )}

        {message && (
          <div className="mt-6 bg-slate-100 border rounded-xl p-3 font-semibold text-slate-800">
            {message}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900 tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          disabled={resending}
          className="w-full mt-4 bg-slate-100 text-slate-900 py-3 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-60"
        >
          {resending ? "Regenerating OTP..." : "Resend / Regenerate OTP"}
        </button>

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

export default VerifyOtp;