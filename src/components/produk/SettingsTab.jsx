"use client";
import { useEffect, useState } from "react";
import { getOwnerData, updateData } from "../../../services/ownService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Store, 
  Mail, 
  MapPin, 
  Phone, 
  Save,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsTab() {
  const [form, setForm] = useState({
    nama_pemilik: "",
    email: "",
    alamat: "",
    no_hp: "",
    hero_title: "", //Custom text on hero banner
    hero_subtitle: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchOwner();
  }, []);
  
  async function fetchOwner() {
    try {
      setLoading(true);
      const data = await getOwnerData();
      setForm({
        nama_pemilik: data.nama_pemilik || "",
        email: data.email || "",
        alamat: data.alamat || "",
        no_hp: data.no_hp || "",
        hero_title: data.hero_title || "",   // 🔹 Tambahkan ini
        hero_subtitle: data.hero_subtitle || "" // 🔹 Tambahkan ini
      });
    } catch (err) {
      toast.error("Gagal memuat profil toko");
    } finally {
      setLoading(false);
    }
  }
  
  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama_pemilik.trim()) {
      toast.error("Nama toko tidak boleh kosong");
      return;
    }
    if (form.email && !isValidEmail(form.email)) {
      toast.error("Format email tidak valid");
      return;
    }
    try {
      setSaving(true);
      await updateData(form);
      toast.success("Profil toko berhasil diperbarui");
    } catch (err) {
      toast.error(err.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  }
  
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Profil Toko
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Informasi ini akan ditampilkan di website.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Toko */}
            <div className="space-y-2">
              <Label htmlFor="nama_pemilik" className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                <Building2 className="h-4 w-4 text-gray-500" />
                Nama Toko <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama_pemilik"
                name="nama_pemilik"
                value={form.nama_pemilik}
                onChange={handleChange}
                placeholder="Contoh: Warung Sederhana"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Hero Title */}
            <div className="space-y-2">
              <Label htmlFor="hero_title" className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                <Store className="h-4 w-4 text-gray-500" />
                Judul Hero Banner
              </Label>
              <Input
                id="hero_title"
                name="hero_title"
                value={form.hero_title}
                onChange={handleChange}
                placeholder="Contoh: Nikmati Cita Rasa"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Hero Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="hero_subtitle" className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                <Store className="h-4 w-4 text-gray-500" />
                Subjudul Hero Banner (boleh pakai enter)
              </Label>
              <Textarea
                id="hero_subtitle"
                name="hero_subtitle"
                value={form.hero_subtitle}
                onChange={handleChange}
                placeholder={`Contoh: Dimsum Rumahan\n dengan Rasa Premium`}
                rows={3}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">Gunakan '\n' untuk membuat baris baru.</p>
            </div>

            <Separator className="my-5" />

            {/* Informasi Kontak */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4 text-gray-500" />
                Informasi Kontak
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@tokomu.com"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* No HP */}
                <div className="space-y-2">
                  <Label htmlFor="no_hp" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Phone className="h-4 w-4 text-gray-500" />
                    No HP / WhatsApp
                  </Label>
                  <Input
                    id="no_hp"
                    name="no_hp"
                    value={form.no_hp}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Alamat */}
              <div className="mt-5 space-y-2">
                <Label htmlFor="alamat" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Alamat Lengkap
                </Label>
                <Input
                  id="alamat"
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  placeholder="Jl. Merdeka No. 123, Kota..."
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#A65C37] hover:bg-[#8c4d2f] text-white font-medium rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}