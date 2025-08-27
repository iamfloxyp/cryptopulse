// src/services/auth.js
// Front-end stub that mimics OTP flow.
// Later we will replace with real Vonage calls from a backend.

export async function startVerify({ phone }) {
  if (!phone || phone.length < 7) {
    return { ok: false, error: 'Enter a valid phone number' };
  }
  // Simulate a request id and a fixed dev code
  return {
    ok: true,
    requestId: 'dev-' + Date.now(),
    devCode: '123456', // show this only in dev UI
  };
}

export async function checkVerify({ requestId, code }) {
  if (!requestId) return { ok: false, error: 'Missing request id' };
  if (code === '123456') return { ok: true };
  return { ok: false, error: 'Invalid code' };
}