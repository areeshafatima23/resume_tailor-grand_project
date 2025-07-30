"use client";

import { useState, useEffect, useCallback } from "react";

export default function Home() {
  const [magic, setMagic] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorError, setTailorError] = useState("");

  useEffect(() => {
  const magicKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
  if (!magicKey) {
    console.error("Magic key is missing!");
    setAuthError("Configuration error. Please contact support.");
    return;
  }

  import("magic-sdk").then(({ Magic }) => {
    setMagic(new Magic(magicKey));
  });
}, []);


  useEffect(() => {
    if (!magic) return;
    magic.user.isLoggedIn().then(setIsLoggedIn);
  }, [magic]);

  const sendMagicLink = useCallback(async () => {
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
  }, [magic, email]);

  const logout = useCallback(async () => {
    if (!magic) return;
    await magic.user.logout();
    setIsLoggedIn(false);
    setEmail("");
    setResume("");
    setJobDesc("");
    setTailoredResume("");
    setTailorError("");
  }, [magic]);

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
            className="w-full p-3 mb-4 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-lg font-semibold placeholder-gray-500 text-gray-900"
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
          <h1 className="text-3xl font-bold text-indigo-700">AI-Powered Resume Tailor</h1>
          <button
            onClick={logout}
            className="text-sm font-semibold text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-semibold text-black">Your Resume</label>
            <textarea
              rows={6}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              className="w-full mt-1 p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-lg font-semibold leading-relaxed font-sans placeholder-gray-500 text-gray-900"
              placeholder="Paste your resume here..."
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-black">Job Description</label>
            <textarea
              rows={6}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full mt-1 p-3 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-lg font-semibold leading-relaxed font-sans placeholder-gray-500 text-gray-900"
              placeholder="Paste the job description here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={tailorLoading || !resume.trim() || !jobDesc.trim()}
            className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition duration-200 ${
              tailorLoading || !resume.trim() || !jobDesc.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {tailorLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Tailoring Resume...
              </span>
            ) : "Tailor My Resume"}
          </button>
        </form>

        {tailorError && (
          <div className="mt-4 p-3 text-sm font-semibold text-red-800 bg-red-100 rounded-md border border-red-300">
            ⚠️ {tailorError}
          </div>
        )}

        {tailoredResume && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Tailored Resume</h2>
            <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap text-base leading-relaxed font-sans text-gray-900">
              {tailoredResume}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
