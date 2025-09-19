"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying magic link...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing token.');
      return;
    }
    const run = async () => {
      try {
        const res = await fetch('/api/verify-login-token', {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setMessage(data.error || 'Invalid or expired link.');
          return;
        }
        const data = await res.json();
        if (data.email) {
          try { localStorage.setItem('rb_email', data.email); } catch {}
        }
        setStatus('success');
        setMessage('Login successful! Redirecting...');
        setTimeout(() => router.replace('/'), 1200);
      } catch {
        setStatus('error');
        setMessage('Network error.');
      }
    };
    run();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      <div className="max-w-sm w-full p-8 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm text-center">
        <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Magic Link</h1>
        <p className={`text-sm mb-4 ${status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{message}</p>
        {status === 'success' && <div className="text-3xl">✅</div>}
        {status === 'verifying' && <div className="flex items-center justify-center mt-2"><svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg></div>}
        {status === 'error' && <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold">Back Home</button>}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">Loading...</div>}>
      <VerifyInner />
    </Suspense>
  );
}
