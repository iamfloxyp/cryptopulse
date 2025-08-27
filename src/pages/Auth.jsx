// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ add useLocation
import Button from "../components/Button";
import { useAuth } from "../store/useAuth";

export default function Auth() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation(); // ✅ capture where user came from

  // read redirect target, default to "/"
  const from = location.state?.from?.pathname || "/";

  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("form");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
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

  // --- LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    if (!phone.trim()) return setError("Enter your phone number");
    login({ phone: phone.trim() });
    nav(from, { replace: true }); // ✅ go back to original page
  };

  // --- SIGNUP STEP 1
  const handleSendCode = (e) => {
    e.preventDefault();
    if (!phone.trim()) return setError("Enter your phone number");

    const demo = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(demo);
    setStep("verify");
    setError("");
    alert(`Demo verification code: ${demo}`);
  };

  // --- SIGNUP STEP 2
  const handleVerify = (e) => {
    e.preventDefault();
    if (code.trim() !== sentCode) return setError("Invalid code. Try again.");
    login({ phone: phone.trim(), createdAt: Date.now() });
    nav(from, { replace: true }); // ✅ go back to original page
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-center mb-4">
          {mode === "login"
            ? "Login"
            : step === "form"
            ? "Sign Up"
            : "Verify your phone"}
        </h1>

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

        {/* --- SIGNUP STEP 1 --- */}
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

        {/* --- SIGNUP STEP 2 --- */}
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

        {/* Switch link */}
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