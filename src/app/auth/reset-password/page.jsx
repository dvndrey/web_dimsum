"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [readyToUpdate, setReadyToUpdate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const hash = window.location.hash;

        if (!hash.includes("access_token")) {
          setError("Link reset tidak valid.");
          return;
        }

        const params = new URLSearchParams(hash.substring(1)); 
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (!access_token || !refresh_token) {
          setError("Token reset tidak ditemukan atau sudah kadaluarsa.");
          return;
        }

        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          console.error("setSession error:", error);
          setError("Link reset tidak valid atau sudah kadaluarsa.");
          return;
        }

        if (data?.session) {
          console.log("Session valid ✅", data.session);
          setReadyToUpdate(true);
        } else {
          setError("Link reset tidak valid atau sudah kadaluarsa.");
        }
      } catch (err) {
        console.error("Unhandled reset error:", err);
        setError("Terjadi kesalahan saat memproses link reset.");
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Password tidak cocok");
    }

    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      toast.success("Password berhasil diubah!");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error("Reset error:", err);
      setError(err.message || "Terjadi kesalahan saat mengubah password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-gray-600 text-center mb-6">
          Masukkan password baru Anda
        </p>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded mb-4">
            Password berhasil diubah!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Password Baru</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || success || !readyToUpdate}
            />
          </div>
          <div>
            <Label>Konfirmasi Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || success || !readyToUpdate}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#a66c4a] hover:bg-[#8c5a3c] text-white"
            disabled={loading || success || !readyToUpdate}
          >
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </form>
      </div>
    </div>
  );
}
