import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Privacy & Transparency",
//   description:
//     "Privacy‑first by design: no ads, no trackers, your data stays in your browser. Learn how PDF export works and what minimal data our APIs process.",
// };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-4 py-12 flex justify-center bg-white dark:bg-neutral-950">
      <article className="w-full max-w-3xl prose prose-gray dark:prose-invert">
        <h1>Privacy & Transparency</h1>
        <p className="lead">Updated: {new Date().toLocaleDateString()}</p>

        <h2>Our Principles</h2>
        <ul>
          <li><strong>No ads. No trackers.</strong> We do not use third‑party analytics beacons or advertising pixels.</li>
          <li><strong>Your data stays yours.</strong> Resume content you enter remains in your browser by default.</li>
          <li><strong>Free forever.</strong> All core features are available at no cost—no trials, no paywalls.</li>
        </ul>

        <h2>What leaves your browser</h2>
        <p>
          Only when you explicitly export a PDF do we send your resume data to our server to render the printable page. The
          server generates a PDF and immediately returns it to you.
        </p>
        <ul>
          <li><strong>Endpoint:</strong> <code>/api/export-pdf</code></li>
          <li><strong>Data:</strong> Selected template and resume fields (name, contact, experience, skills, etc.)</li>
          <li><strong>Retention:</strong> We do not persist the PDF or payload; it’s processed in memory for the response only.</li>
        </ul>

        <h2>Optional email login</h2>
        <p>
          If you choose to log in via email, the app calls <code>/api/send-login-link</code> to send a magic link using your
          configured SMTP server (e.g., Mailtrap for testing). We do not store email addresses on the server.
        </p>

        <h2>Metrics</h2>
        <p>
          We maintain lightweight, <strong>in‑memory</strong> counters for page hits and resume downloads via <code>/api/metrics</code>.
          These counters are non‑identifying and reset on server restarts. For persistence, a self‑hosted database or KV can be used.
        </p>

        <h2>Cookies & Storage</h2>
        <ul>
          <li>
            <strong>sessionStorage:</strong> We set a one‑time key per tab to avoid double‑counting page hits in development/strict mode.
          </li>
          <li>
            <strong>No tracking cookies:</strong> We do not set marketing or analytics cookies.
          </li>
        </ul>

        <h2>Contact</h2>
        <p>
          Questions or concerns? Please open an issue or reach out via the contact method you prefer for this deployment.
        </p>
      </article>
    </main>
  );
}
