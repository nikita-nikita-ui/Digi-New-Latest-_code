
import React, { useState, useRef, useEffect } from "react";
import { FiPhone, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import defaulting from "../assets/logo(1).png";
import { sendAdminOtp, verifyAdminOtp , resendAdminOtp } from "../auth/adminLogin";

const Login = () => {
  const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const [phone, setPhone] = useState("");
const [loading, setLoading] = useState(false);
const [showOtpModal, setShowOtpModal] = useState(false);
const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
const [verifying, setVerifying] = useState(false);
const [resendTimer, setResendTimer] = useState(0);
const [resending, setResending] = useState(false);

  const otpRefs = useRef([]);
  const navigate = useNavigate();



const isValidPhone = (value) => /^\d{10}$/.test(value); 

const handleSendOtp = async (e) => {
  e.preventDefault();

  if (!phone) {
    toast.error("Please enter your phone number");
    return;
  }

  if (!isValidPhone(phone)) {
    toast.error("Please enter a valid 10-digit phone number");
    return;
  }

  setLoading(true);

  try {
    const response = await sendAdminOtp(phone);

    toast.success(response?.message || "OTP sent to your phone");

    setOtp(Array(OTP_LENGTH).fill(""));
    setResendTimer(RESEND_SECONDS);
    setShowOtpModal(true);

    setTimeout(() => otpRefs.current[0]?.focus(), 200);
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
};


const handleVerifyOtp = async (otpValue) => {
  const code = otpValue || otp.join("");
  if (code.length !== OTP_LENGTH) {
    toast.error("Please enter the complete OTP");
    return;
  }

  setVerifying(true);
  try {
    const response = await verifyAdminOtp(phone, code);

    localStorage.setItem("token", response.token);
    localStorage.setItem("isLoggedIn", "true");

    toast.success("Login successful!");
    setShowOtpModal(false);

    setTimeout(() => {
      navigate("/");
    }, 800);
  } catch (error) {
    toast.error(error.message || "Invalid OTP");
  } finally {
    setVerifying(false);
  }
};

useEffect(() => {
  if (resendTimer <= 0) return;
  const interval = setInterval(() => {
    setResendTimer((prev) => prev - 1);
  }, 1000);
  return () => clearInterval(interval);
}, [resendTimer]);

const handleResendOtp = async () => {
  if (resendTimer > 0) return;

  setResending(true);
  try {
    const response = await resendAdminOtp(phone);
    toast.success(response?.message || "OTP resent to your phone");

    setOtp(Array(OTP_LENGTH).fill(""));
    setResendTimer(RESEND_SECONDS);
    setTimeout(() => otpRefs.current[0]?.focus(), 200);
  } catch (error) {
    toast.error(error?.message || "Failed to resend OTP");
  } finally {
    setResending(false);
  }
};



 const handleOtpChange = (index, value) => {
  if (!/^\d*$/.test(value)) return; // digits only
  const newOtp = [...otp];
  newOtp[index] = value.slice(-1);
  setOtp(newOtp);

  if (value && index < OTP_LENGTH - 1) {
    otpRefs.current[index + 1]?.focus();
  }

  // 👇 Auto-submit jab sabhi digits fill ho jayein
  if (value && index === OTP_LENGTH - 1) {
    const completeOtp = newOtp.join("");
    if (completeOtp.length === OTP_LENGTH) {
      handleVerifyOtp(completeOtp); // pass directly, state update async hota hai
    }
  }
};

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

 const handleOtpPaste = (e) => {
  const pasted = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH);
  if (!pasted) return;
  const newOtp = Array(OTP_LENGTH).fill("");
  pasted.split("").forEach((digit, i) => (newOtp[i] = digit));
  setOtp(newOtp);
  otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();

  // 👇 agar paste se poora OTP aa gaya to auto-verify
  if (pasted.length === OTP_LENGTH) {
    handleVerifyOtp(pasted);
  }
};
  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <Toaster position="top-center" />

     <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-2">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center shadow-lg mb-4">
            <img src={defaulting} alt="logo" className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">
            Time2Cash Admin Panel Login
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign in with your phone number
          </p>
        </div>

<div className="bg-white w-[80%] max-w-md mx-auto rounded-3xl shadow-xl border border-orange-100 p-8">
          <form onSubmit={handleSendOtp}>
            {/* Phone */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  maxLength={10}
                  className="w-full pl-20 pr-4 py-3 rounded-xl border border-orange-200 bg-orange-50 focus:ring-2 focus:ring-orange-200 outline-none"
                  required
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-2xl bg-[#FE702E] hover:bg-orange-600 text-white font-semibold text-lg transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © Time2Cash App Admin Panel
        </p>
      </div>

      {/* OTP Popup Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowOtpModal(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                <FiPhone className="text-[#FE702E]" size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Verify OTP</h2>
              <p className="text-gray-500 text-sm mt-1">
                Code sent to{" "}
                <span className="font-medium text-gray-700">+91 {phone}</span>
              </p>
            
            </div>

            {/* OTP Boxes */}
            <div
              className="flex justify-center gap-2 mb-6"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl border border-orange-200 bg-orange-50 focus:ring-2 focus:ring-orange-300 outline-none"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={verifying}
              className={`w-full py-3 rounded-2xl bg-[#FE702E] hover:bg-orange-600 text-white font-semibold text-lg transition mb-4 ${
                verifying ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {verifying ? "Verifying..." : "Verify & Login"}
            </button>
<p className="text-center text-sm text-gray-500">
  {resendTimer > 0 ? (
    <>
      Resend OTP in{" "}
      <span className="font-semibold text-[#FE702E]">{resendTimer}s</span>
    </>
  ) : (
    <button
      onClick={handleResendOtp}
      disabled={resending}
      className={`text-[#FE702E] font-semibold hover:underline ${
        resending ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      {resending ? "Resending..." : "Resend OTP"}
    </button>
  )}
</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
