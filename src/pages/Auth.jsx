// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../store/useAuth";

/**
 * Frontend-only demo auth:
 * - Login: phone-only
 * - Sign Up: phone -> OTP (generated locally) -> verify -> login
 */
export default function Auth() {
  const { login } = useAuth();           // from your store/useAuth.js
  const nav = useNavigate();

  const [mode, setMode] = useState("login");          // "login" | "signup"
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("form");           // for signup: "form" | "verify"
  const [code, setCode] = useState("");               // user-entered OTP
  const [sentCode, setSentCode] = useState("");       // generated OTP
  const [error, setError] = useState("");

  const resetAll = () => {
    setPhone("");
    setCode("");
    setSentCode("");
    setStep("form");
    setError("");
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    resetAll();
  };

  // --- LOGIN: simple demo
  const handleLogin = (e) => {
    e.preventDefault();
    if (!phone.trim()) return setError("Enter your phone number");
    login({ phone: phone.trim() });
    nav("/"); // go to dashboard
  };

  // --- SIGNUP: step 1: send code (demo generate)
  const handleSendCode = (e) => {
    e.preventDefault();
    if (!phone.trim()) return setError("Enter your phone number");

    // generate a 6-digit demo code
    const demo = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(demo);
    setStep("verify");
    setError("");

    // NOTE: Demo only – show the code so you can test easily
    // Remove this <alert> in production when you wire a real SMS/Email service.
    alert(`Demo verification code: ${demo}`);
  };

  // --- SIGNUP: step 2: verify
  const handleVerify = (e) => {
    e.preventDefault();
    if (code.trim() !== sentCode) return setError("Invalid code. Try again.");
    // verified – create session locally
    login({ phone: phone.trim(), createdAt: Date.now() });
    nav("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-6 rounded-lg shadow-md">
        {/* Title */}
        <h1 className="text-xl font-semibold text-center mb-4">
          {mode === "login"
            ? "Login"
            : step === "form"
            ? "Sign Up"
            : "Verify your phone"}
        </h1>

        {/* Error */}
        {error && (
          <div className="mb-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded px-3 py-2">
            {error}
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="tel"
              placeholder="Phone (e.g. +2348012345678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input w-full"
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        )}

        {/* --- SIGNUP STEP 1: PHONE --- */}
        {mode === "signup" && step === "form" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              type="tel"
              placeholder="Phone (e.g. +2348012345678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input w-full"
            />
            <Button type="submit" className="w-full">
              Send verification code
            </Button>
          </form>
        )}

        {/* --- SIGNUP STEP 2: VERIFY CODE --- */}
        {mode === "signup" && step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-sm text-muted">
              We sent a 6-digit code to <b>{phone}</b>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input w-full"
            />
            <Button type="submit" className="w-full">
              Verify & Create Account
            </Button>
            <button
              type="button"
              onClick={handleSendCode}
              className="text-xs underline opacity-80"
            >
              Resend code
            </button>
          </form>
        )}

        {/* Switch link (always at the bottom) */}
        <p className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-500 hover:underline"
              >
                Create Account
              </button>
            </>
          ) : step === "form" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-500 hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Entered a wrong number?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setCode("");
                  setSentCode("");
                }}
                className="text-blue-500 hover:underline"
              >
                Change phone
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}