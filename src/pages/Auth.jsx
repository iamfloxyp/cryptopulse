// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../store/useAuth";
import { sendCode, verifyCode } from "../services/auth";

export default function Auth() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const [mode, setMode] = useState("login");     // "login" | "signup"
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("form");      // for signup: "form" | "verify"
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const resetAll = () => {
    setPhone(""); setCode(""); setStep("form"); setError("");
  };
  const toggleMode = () => { setMode(m => m === "login" ? "signup" : "login"); resetAll(); };

  async function handleLogin(e) {
    e.preventDefault();
    if (!phone.trim()) return setError("Enter your phone number");
    setBusy(true);
    try {
      // For demo, login without OTP. If you want OTP even for login, reuse signup flow.
      login({ phone: phone.trim() });
      nav(redirect, { replace: true });
    } finally { setBusy(false); }
  }

  async function handleSendCode(e) {
    e.preventDefault();
    if (!phone.trim()) return setError("Enter your phone number");
    setBusy(true);
    try {
      await sendCode({ phone: phone.trim() });
      setStep("verify");
      setError("");
    } catch {
      setError("Failed to send code. Check your phone number.");
    } finally { setBusy(false); }
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!code.trim()) return setError("Enter the 6-digit code");
    setBusy(true);
    try {
      await verifyCode({ phone: phone.trim(), code: code.trim() });
      login({ phone: phone.trim(), createdAt: Date.now() }); // create local session
      nav(redirect, { replace: true });
    } catch {
      setError("Invalid or expired code.");
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass p-6 rounded-lg shadow-md">
        <h1 className="text-xl font-semibold text-center mb-4">
          {mode === "login" ? "Login" : step === "form" ? "Sign Up" : "Verify your phone"}
        </h1>

        {error && (
          <div className="mb-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded px-3 py-2">
            {error}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="tel"
              placeholder="Phone (e.g. +2348012345678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input w-full"
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Logging in..." : "Login"}
            </Button>
          </form>
        )}

        {mode === "signup" && step === "form" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <input
              type="tel"
              placeholder="Phone (e.g. +2348012345678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input w-full"
            />
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Sending..." : "Send verification code"}
            </Button>
          </form>
        )}

        {mode === "signup" && step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-sm text-muted">We sent a 6-digit code to <b>{phone}</b></div>
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
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Verifying..." : "Verify & Create Account"}
            </Button>
            <button type="button" onClick={handleSendCode} className="text-xs underline opacity-80">
              Resend code
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {mode === "login" ? (
            <>Don’t have an account?{" "}
              <button type="button" onClick={toggleMode} className="text-blue-500 hover:underline">
                Create Account
              </button></>
          ) : step === "form" ? (
            <>Already have an account?{" "}
              <button type="button" onClick={toggleMode} className="text-blue-500 hover:underline">
                Login
              </button></>
          ) : (
            <>Entered a wrong number?{" "}
              <button
                type="button"
                onClick={() => { setStep("form"); setCode(""); }}
                className="text-blue-500 hover:underline"
              >
                Change phone
              </button></>
          )}
        </p>
      </div>
    </main>
  );
}