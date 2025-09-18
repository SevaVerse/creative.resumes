import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Transparency",
  description:
    "Privacy‑first resume builder: no ads or trackers, no persistent storage—learn exactly what minimal data is processed during PDF export.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Privacy & Transparency | Resume Builder",
    description:
      "Zero tracking, zero persistent storage. See how our privacy‑first resume builder handles your data.",
    url: "/privacy",
    type: "article",
  },
  twitter: {
    title: "Privacy & Transparency | Resume Builder",
    description:
      "No trackers. No ads. Your data stays in your browser—learn the details.",
    card: "summary",
  },
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-12 px-4">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <article className="z-10 w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Privacy & Transparency
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Updated: September 18, 2025
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Our Principles */}
          <section className="p-6 md:p-8 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-500/20 text-green-600 dark:bg-green-900/50 dark:text-green-400 rounded-lg flex items-center justify-center border border-green-300/50 dark:border-green-800/50">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Our Core Principles
              </h2>
            </div>
            <div className="grid md:grid-cols-1 gap-4">
              <div className="flex items-start gap-4 p-4 bg-green-50/50 dark:bg-green-900/30 rounded-xl border border-green-200/50 dark:border-green-800/50">
                <div className="w-6 h-6 bg-green-500/20 text-green-600 dark:bg-green-900/50 dark:text-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-300/50 dark:border-green-800/50">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 014.293 4.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                    No Ads. No Trackers.
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    We do not use third-party analytics beacons or advertising
                    pixels.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="w-6 h-6 bg-blue-500/20 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-300/50 dark:border-blue-800/50">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Your Data Stays in Your Hands
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Resume content you enter remains in your browser.{" "}
                    <strong>
                      No data is sent to our servers unless you explicitly choose
                      to export a PDF.
                    </strong>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-purple-50/50 dark:bg-purple-900/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="w-6 h-6 bg-purple-500/20 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-300/50 dark:border-purple-800/50">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                    Free Forever
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    All core features are available at no cost—no trials, no
                    paywalls.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Flow */}
          <section className="p-6 md:p-8 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-500/20 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 rounded-lg flex items-center justify-center border border-orange-300/50 dark:border-orange-800/50">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                What Leaves Your Browser
              </h2>
            </div>
            <div className="bg-red-50/50 dark:bg-red-900/30 p-6 rounded-xl border border-red-200/50 dark:border-red-800/50 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500/20 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-300/50 dark:border-red-800/50">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Important: Your Data Stays Local
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                    <strong>By default, nothing leaves your browser.</strong> Your
                    resume data, personal information, and work history remain
                    entirely on your device. We designed this system to give you
                    complete control over your data.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Only when you explicitly choose to export a PDF do we temporarily
              process your data on our server. Here&apos;s exactly what happens:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-neutral-800/50 rounded-lg border border-gray-200/50 dark:border-neutral-700/50">
                <code className="px-2 py-1 bg-gray-200 dark:bg-neutral-700 rounded text-sm font-mono">
                  /api/export-pdf
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  PDF generation endpoint
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-neutral-800/50 rounded-lg border border-gray-200/50 dark:border-neutral-700/50">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                  Data Sent
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Selected template + resume fields (processed in memory only)
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-neutral-800/50 rounded-lg border border-gray-200/50 dark:border-neutral-700/50">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded text-sm font-medium">
                  Retention
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Zero persistence—processed and immediately discarded
                </span>
              </div>
            </div>
          </section>

          {/* Email Login */}
          <section className="p-6 md:p-8 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-500/20 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-lg flex items-center justify-center border border-indigo-300/50 dark:border-indigo-800/50">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Optional Email Login
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you choose to log in via email, we send a magic link using your
              configured SMTP server (e.g., Mailtrap for testing).
            </p>
            <div className="bg-indigo-50/50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <p className="text-indigo-800 dark:text-indigo-200 text-sm">
                <strong>Privacy Note:</strong> We do not store email addresses on
                the server. The email is used only to send the login link and is
                not retained.
              </p>
            </div>
          </section>

          {/* Metrics */}
          <section className="p-6 md:p-8 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-teal-500/20 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400 rounded-lg flex items-center justify-center border border-teal-300/50 dark:border-teal-800/50">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Anonymous Metrics
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We maintain lightweight,{" "}
              <strong className="text-teal-600 dark:text-teal-400">in-memory</strong>
              {" "}counters for page hits and resume downloads via{" "}
              <code className="bg-gray-100 dark:bg-neutral-700 px-2 py-1 rounded text-sm">
                /api/metrics
              </code>
              .
            </p>
            <div className="bg-teal-50/50 dark:bg-teal-900/30 p-4 rounded-xl border border-teal-200/50 dark:border-teal-800/50">
              <p className="text-teal-800 dark:text-teal-200 text-sm">
                <strong>Privacy-First:</strong> These counters are completely
                anonymous and reset on server restarts. For persistence, you can
                optionally use a self-hosted database or KV store.
              </p>
            </div>
          </section>

          {/* Cookies & Storage */}
          <section className="p-6 md:p-8 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-pink-500/20 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400 rounded-lg flex items-center justify-center border border-pink-300/50 dark:border-pink-800/50">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cookies & Browser Storage
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-neutral-800/50 rounded-lg border border-gray-200/50 dark:border-neutral-700/50">
                <div className="w-5 h-5 bg-blue-500/20 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-300/50 dark:border-blue-800/50">
                  <span className="text-xs font-bold">S</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    sessionStorage
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    One-time key per tab to prevent double-counting page hits in
                    development mode.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-green-50/50 dark:bg-green-900/30 rounded-xl border border-green-200/50 dark:border-green-800/50">
                <div className="w-5 h-5 bg-green-500/20 text-green-600 dark:bg-green-900/50 dark:text-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-300/50 dark:border-green-800/50">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                    No Tracking Cookies
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    We do not set marketing or analytics cookies.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 md:p-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Concerns or Feedback?</h2>
            </div>
            <p className="text-blue-100 mb-4">
              We&apos;re committed to transparency and your privacy. If you have
              any concerns or feedback about how we handle your data or our
              practices, please don&apos;t hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://github.com/SevaVerse/creative.resumes"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 20 0 20 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Open an Issue on GitHub
              </a>
              <a
                href="mailto:akshaysin@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                akshaysin@gmail.com
              </a>
            </div>
          </section>
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            &larr; Back to Home
          </Link>
        </div>
      </article>
    </main>
  );
}
