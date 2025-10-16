"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "../../../lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

const handleForgotPassword = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`, 
    });

    if (error) throw error;

    setForgotSent(true);
    toast.success("Link reset password telah dikirim ke email Anda.");
    setForgotEmail("");
  } catch (err) {
    setError(err.message || "Gagal mengirim email reset.");
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/pusat");
    } catch (err) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Desktop: split screen */}
      <div className="hidden md:flex min-h-screen bg-white">
        {/* Left */}
        <div className="w-1/2 bg-gradient-to-b from-[#f5e9d8] to-[#683922] flex flex-col justify-center items-center p-12 text-white">
          <div className="text-center max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Welcome Back, <br /> Say! Endulque
            </h1>
            <p className="text-lg opacity-90">
              Manage your restaurant system with ease and keep the flavour alive
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/2 flex flex-col justify-center items-center p-12 bg-white">
        {!showForgot ? (
          <div className="w-full max-w-md space-y-1">
            <div className="flex justify-center">
              <Image src="/logo_client.png" alt="Logo" width={80} height={80} className="h-20 w-auto" />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-800">Admin Login Panel</h2>
            <p className="text-sm text-center text-gray-500">Please log in to continue</p>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a373] focus:border-transparent text-gray-900"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a373] focus:border-transparent text-gray-900"
                  placeholder="****************"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#a66c4a] hover:bg-[#8c5a3c] text-white font-medium py-2 rounded-md transition"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Login"}
              </Button>
            </form>

            <div className="text-center mt-4 text-sm font-bold">
              <Link href="#" onClick={() => setShowForgot(true)} className="text-[#F97D3F] hover:underline mr-4">Forgot Password?</Link>
              <span className="text-gray-400">|</span>
              <Link href="/" className="text-[#F97D3F] hover:underline ml-4">Back to Home</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="mt-6 space-y-4 flex flex-col items-center">
            <p className="text-sm text-gray-600">
              Masukkan email Anda, kami akan kirim link untuk reset password.
            </p>
            <Input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="bg-gray-50 border border-gray-300 rounded-md px-4 focus:outline-none focus:ring-2 focus:ring-[#d4a373]"
            />
            <Button
              type="submit"
              className="w-full bg-[#a66c4a] hover:bg-[#8c5a3c] text-white"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowForgot(false);
                setForgotEmail("");
                setError("");
              }}
              className="text-sm text-gray-500 hover:underline"
            >
              ← Kembali ke login
            </button>
          </form>
        )}
        </div>
      </div>

      {/* Mobile: full center */}
      <div className="md:hidden min-h-screen w-full bg-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md space-y-1 px-6">
          <div className="flex justify-center">
            <Image src="/logo_client.png" alt="Logo" width={80} height={80} className="h-20 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800">Admin Login Panel</h2>
          <p className="text-sm text-center text-gray-500">Please log in to continue</p>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a373] focus:border-transparent text-gray-900"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a373] focus:border-transparent text-gray-900"
                placeholder="****************"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#a66c4a] hover:bg-[#8c5a3c] text-white font-medium py-2 rounded-md transition"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm font-bold">
            <Link href="#" className="text-[#F97D3F] hover:underline mr-4">Forgot Password?</Link>
            <span className="text-gray-400">|</span>
            <Link href="/" className="text-[#F97D3F] hover:underline ml-4">Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}