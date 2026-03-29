"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function VerifyPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="w-full max-w-sm mx-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="flex justify-center mb-5">
          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-slate-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-900">Verify your email</h1>
        <p className="text-sm text-center text-slate-500 mt-2 mb-1">
          We&apos;ve sent a 6-digit code to
        </p>
        <p className="text-sm text-center font-semibold text-slate-700 mb-6">
          test@gmail.com
        </p>

        {/* Code inputs */}
        <div className="flex justify-center gap-2.5 mb-4">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-0 transition-colors"
            />
          ))}
        </div>

        <p className="text-xs text-center text-slate-400 mb-6">
          Enter the verification code sent to your email
        </p>

        <button className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
          Verify email
        </button>

        <p className="text-sm text-center text-slate-500 mt-4">
          Didn&apos;t receive the code?{" "}
          <button className="text-slate-900 font-semibold hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
}
