"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [magic, setMagic] = useState<any>(null);

  // Auth state
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Resume tailoring state
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorError, setTailorError] = useState("");

  // Initialize Magic on client only
  useEffect(() => {
    import("magic-sdk").then(({ Magic }) => {
      setMagic(new Magic("pk_live_F6B6B81DED0251E0"));
    });
  }, []);

  // Check login status once magic is ready
  useEffect(() => {
    if (!magic) return;
    async function checkLogin() {
      const loggedIn = await magic.user.isLoggedIn();
      setIsLoggedIn(loggedIn);
    }
    checkLogin();
  }, [magic]);

  // Handle sending magic link
  const sendMagicLink = async () => {
    if (!magic) return;
    setAuthError("");
    setAuthLoading(true);
    try {
      await magic.auth.loginWithMagicLink({ email });
      setIsLoggedIn(true);
      alert("Magic link sent! Please check your email to complete login.");
    } catch {
      setAuthError("Failed to send magic link. Please try again.");
    }
    setAuthLoading(false);
  };

  // Handle logout
  const logout = async () => {
    if (!magic) return;
    await magic.user.logout();
    setIsLoggedIn(false);
    setEmail("");
    setResume("");
    setJobDesc("");
    setTailoredResume("");
    setTailorError("");
  };

  // Handle resume tailoring submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTailorError("");
    setTailoredResume("");
    setTailorLoading(true);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDesc }),
      });

      const data = await res.json();

      if (res.ok) {
        setTailoredResume(data.tailoredResume);
      } else {
        setTailorError(data.error || "Something went wrong");
      }
    } catch {
      setTailorError("Network error");
    }

    setTailorLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
            Login with Magic Link
          </h1>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-lg font-semibold placeholder-black text-gray-900"
          />
          <button
            onClick={sendMagicLink}
            disabled={authLoading || !email || !magic}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition duration-200"
          >
            {authLoading ? "Sending magic link..." : "Send Magic Link"}
          </button>
          {authError && (
            <p className="mt-4 text-red-700 bg-red-100 rounded-md p-3 border border-red-300 text-sm font-semibold">
              ⚠️ {authError}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">
            AI-Powered Resume Tailor
          </h1>
          <button
            onClick={logout}
            className="text-sm font-semibold text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-semibold text-black">
              Your Resume
            </label>
            <textarea
              rows={6}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              className="w-full mt-1 p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-lg font-semibold leading-relaxed font-sans placeholder-black text-gray-900"
              placeholder="Paste your resume here..."
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-black">
              Job Description
            </label>
            <textarea
              rows={6}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full mt-1 p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-lg font-semibold leading-relaxed font-sans placeholder-black text-gray-900"
              placeholder="Paste the job description here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={tailorLoading}
            className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            {tailorLoading ? "Tailoring Resume..." : "Tailor My Resume"}
          </button>
        </form>

        {tailorError && (
          <div className="mt-4 p-3 text-sm font-semibold text-red-800 bg-red-100 rounded-md border border-red-300">
            ⚠️ {tailorError}
          </div>
        )}

        {tailoredResume && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Tailored Resume
            </h2>
            <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap text-base font-mono leading-relaxed font-semibold text-gray-900">
              {tailoredResume}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
