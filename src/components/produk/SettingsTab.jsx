"use client";
import { useEffect, useState } from "react";
import { getOwnerData, updateData } from "../../../services/ownService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Store, 
  Mail, 
  MapPin, 
  Phone, 
  Save,
  User,
  Building2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsTab() {
  const [form, setForm] = useState({
    nama_pemilik: "",
    email: "",
    alamat: "",
    no_hp: "",
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
    // Basic validation
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
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat pengaturan...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Store className="h-5 w-5" />
              Profil Toko
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Informasi ini akan ditampilkan pada beberapa halaman website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="nama_pemilik" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Building2 className="h-4 w-4" />
                  Nama Toko *
                </Label>
                <Input
                  id="nama_pemilik"
                  name="nama_pemilik"
                  value={form.nama_pemilik}
                  onChange={handleChange}
                  placeholder="Masukkan nama toko..."
                  className="transition-colors focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <Separator className="my-4" />
              
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informasi Kontak
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="contoh@email.com"
                      className="transition-colors focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="no_hp" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Phone className="h-4 w-4" />
                      No HP/WhatsApp
                    </Label>
                    <Input
                      id="no_hp"
                      name="no_hp"
                      value={form.no_hp}
                      onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                      className="transition-colors focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="alamat" className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="h-4 w-4" />
                    Alamat Toko
                  </Label>
                  <Input
                    id="alamat"
                    name="alamat"
                    value={form.alamat}
                    onChange={handleChange}
                    placeholder="Masukkan alamat lengkap toko..."
                    className="transition-colors focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 min-w-[140px] bg-[#A65C37] hover:bg-[#7f4629] text-white"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        
        {/* Additional Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          
          {/* Security Settings */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-base text-gray-900 dark:text-white">Keamanan</CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                Atur password dan keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600" disabled>
                Segera Hadir
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}