"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Calendar as CalendarIcon } from "lucide-react";

// Add-ons services
import {
  getAddOnsByProduk,
  addAddOn,
  updateAddOn,
  deleteAddOn
} from "../../../services/addOnService";

import {
  getProduk,
  addProduk,
  updateProduk,
  deleteProduk,
} from "../../../services/productService";
import { getCategory } from "../../../services/categoryService";
import {
  getVarianByProduk,
  addVarian,
  updateVarian,
  deleteVarian,
} from "../../../services/variantService";
import { toast } from "sonner";
// shadcn components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Package, 
  Tag, 
  ImageIcon,
  Settings,
  Grid3X3,
  List,
  Eye,
  Upload,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// 🔹 Import untuk ready dates
import {
  getReadyDates,
  addReadyDate,
  deleteReadyDate
} from "../../../services/readyService";

// 🔹 Import DayPicker
import { DayPicker, useNavigation } from 'react-day-picker';
import 'react-day-picker/style.css'

function CustomCalendarFooter(props) {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  return (
    <div className="mt-4">
      {/* Render original footer content (selected count) */}
      {props.footer}
      
      {/* Bottom Navigation */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Prev
        </Button>
        
        <Button 
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default function ProdukTab() {
  const [produk, setProduk] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  
  const [deletingProdukId, setDeletingProdukId] = useState(null);
  // 🔹 Tambah state untuk loading submit produk
  const [submittingProduk, setSubmittingProduk] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduk, setEditingProduk] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
 
  const [editingVarian, setEditingVarian] = useState(null);

  const namaRef = useRef();
  const descRef = useRef();
  const categoryRef = useRef();
  const filesRef = useRef();

  const [varianList, setVarianList] = useState([]);
  const [variantForm, setVariantForm] = useState({
    nama: "",
    harga: "",
    stok: ""
  });

  // 🔹 State untuk ready dates modal & selection
  const [showReadyDateModal, setShowReadyDateModal] = useState(false);
  const [readyDates, setReadyDates] = useState([]); // [{ id_ready, tanggal }, ...]
  const [selectedReadyDates, setSelectedReadyDates] = useState([]); // Date[] (untuk kalender)

  // 🔹 Add-ons state - MODAL TERPISAH
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [addOnList, setAddOnList] = useState([]);
  const [addOnForm, setAddOnForm] = useState({ nama: "", harga: "" });
  const [editingAddOn, setEditingAddOn] = useState(null);

  // 🔹 Variant state - MODAL TERPISAH
  const [showVariantModalForm, setShowVariantModalForm] = useState(false);

  const [imagePreviews, setImagePreviews] = useState([]); 
  const [existingImages, setExistingImages] = useState([]);

  // 🔹 Helper: convert "YYYY-MM-DD" ↔ Date (tanpa jam, timezone-safe)
  const parseDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d); // month is 0-indexed
  };
  const formatDate = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProduk(), getCategory()]);
      setProduk(p || []);
      setCategories(c || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }
  
  function openAdd() {
    setEditingProduk(null);
    setExistingImages([]);
    setImagePreviews([]);
    setShowAddModal(true);
    setTimeout(() => {
      if (namaRef.current) namaRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = "";
      if (filesRef.current) filesRef.current.value = null;
    }, 50);
  }
  
  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    // Jangan reset existingImages saat edit, hanya saat tambah baru
    if (!editingProduk) {
      setExistingImages([]);
    }
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  }

  function openEdit(p) {
    setEditingProduk(p);
    setShowAddModal(true);
    setExistingImages(p.url_gambar || []); 
    setImagePreviews([]);

    setTimeout(() => {
      if (namaRef.current) namaRef.current.value = p.nama_produk || "";
      if (descRef.current) descRef.current.value = p.deskripsi || "";
      if (categoryRef.current) categoryRef.current.value = p.id_kategori || "";
      if (filesRef.current) filesRef.current.value = null; 
    }, 50);
  }
  
  async function submitProduk(e) {
    e.preventDefault();
    setSubmittingProduk(true); // Mulai loading
    
    const nama = namaRef.current.value.trim();
    const deskripsi = descRef.current.value.trim();
    const id_kategori = categoryRef.current.value;
    const files = filesRef.current.files ? Array.from(filesRef.current.files) : [];
    
    if (!nama) {
      toast.error("Nama produk wajib diisi");
      setSubmittingProduk(false);
      return;
    }
    if (!id_kategori) {
      toast.error("Pilih kategori");
      setSubmittingProduk(false);
      return;
    }
    
    try {
      if (editingProduk) {
        // 🔹 Kirim existingImages ke updateProduk untuk dihapus jika ada gambar baru
        await updateProduk(
          editingProduk.id_produk, 
          nama, 
          deskripsi, 
          id_kategori, 
          files,
          existingImages // Kirim gambar lama untuk dihapus
        );
        toast.success("Produk berhasil diperbarui");
      } else {
        await addProduk(nama, deskripsi, id_kategori, files);
        toast.success("Produk berhasil ditambahkan");
      }
      setShowAddModal(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan produk");
    } finally {
      setSubmittingProduk(false); // Selesai loading
    }
  }
  
  async function handleDeleteProduk(id) {
    setDeletingProdukId(id);
    try {
      const result = await deleteProduk(id);
      
      if (result.type === 'soft_delete') {
        toast.success("Produk ditandai sebagai dihapus (masih ada data pesanan terkait)");
      } else {
        toast.success("Produk berhasil dihapus permanen");
      }
      
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus produk");
    } finally {
      setDeletingProdukId(null);
    }
  }

  // 🔹 Buka modal atur tanggal ready untuk produk terpilih
  async function openReadyDateModal(p) {
    setSelectedProduk(p);
    try {
      const dates = await getReadyDates(p.id_produk);
      setReadyDates(dates);
      // Convert ke array Date untuk kalender
      const dateObjects = dates.map(d => parseDate(d.tanggal)).filter(Boolean);
      setSelectedReadyDates(dateObjects);
      setShowReadyDateModal(true);
    } catch (err) {
      console.error('Gagal memuat tanggal ready:', err);
      toast.error('Gagal memuat tanggal ready');
    }
  }

  // 🔹 Simpan perubahan tanggal ready
  async function applyReadyDates() {
    if (!selectedProduk) return;

    try {
      const currentIds = new Set(readyDates.map(d => d.id_ready));
      const selectedStrings = selectedReadyDates.map(formatDate);
      const selectedSet = new Set(selectedStrings);

      // ❗ Hanya tanggal ≥ hari ini (client-side validation extra)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const invalidDates = selectedReadyDates.filter(date => date < today);
      if (invalidDates.length > 0) {
        toast.error('Tanggal harus di masa depan atau hari ini');
        return;
      }

      // 🔹 Cari yang perlu ditambah
      const toAdd = selectedStrings.filter(dateStr => {
        return !readyDates.some(d => d.tanggal === dateStr);
      });

      // 🔹 Cari yang perlu dihapus
      const toDelete = readyDates.filter(d => !selectedSet.has(d.tanggal));

      // 🔹 Eksekusi parallel
      const promises = [];

      toAdd.forEach(dateStr => {
        promises.push(addReadyDate(selectedProduk.id_produk, dateStr));
      });

      toDelete.forEach(d => {
        promises.push(deleteReadyDate(d.id_ready));
      });

      await Promise.all(promises);

      // 🔹 Refetch & update state
      const updated = await getReadyDates(selectedProduk.id_produk);
      setReadyDates(updated);
      toast.success('Tanggal ready berhasil diperbarui');
      setShowReadyDateModal(false);

    } catch (err) {
      console.error('Gagal menyimpan tanggal ready:', err);
      toast.error(err.message || 'Gagal menyimpan tanggal ready');
    }
  }
  
  // 🔹 Buka modal variant settings - DIPERBAIKI: load semua data sekaligus
  async function openVarian(p) {
    setSelectedProduk(p);
    setShowVariantModal(true);
    setEditingVarian(null);
    setVariantForm({ nama: "", harga: "", stok: "" });
    
    try {
      const [v, a, dates] = await Promise.all([
        getVarianByProduk(p.id_produk),
        getAddOnsByProduk(p.id_produk),
        getReadyDates(p.id_produk)
      ]);
      setVarianList(v || []);
      setAddOnList(a || []);
      setReadyDates(dates || []); // 🔹 Load tanggal ready langsung
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data settings");
    }
  }

  // 🔹 Buka modal add-ons terpisah
  async function openAddOnModal() {
    setShowAddOnModal(true);
    setEditingAddOn(null);
    setAddOnForm({ nama: "", harga: "" });
  }

  // 🔹 Buka modal variant terpisah
  function openVariantModalForm() {
    setShowVariantModalForm(true);
    setEditingVarian(null);
    setVariantForm({ nama: "", harga: "", stok: "" });
  }

  // 🔹 Buka modal edit variant
  function openEditVariant(v) {
    setEditingVarian(v);
    setVariantForm({
      nama: v.nama_varian,
      harga: v.harga_varian?.toString() || "",
      stok: v.stok_varian?.toString() || ""
    });
    setShowVariantModalForm(true);
  }
  
  async function handleDeleteVarian(id_varian) {
    try {
      await deleteVarian(id_varian);
      toast.success("Varian berhasil dihapus");
      const v = await getVarianByProduk(selectedProduk.id_produk);
      setVarianList(v || []);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus varian");
    }
  }
  
  async function submitVariant(e) {
    e.preventDefault();
    const { nama, harga, stok } = variantForm;
    if (!nama.trim()) return toast.error("Nama varian wajib diisi");
    try {
      if (editingVarian) {
        await updateVarian(editingVarian.id_varian, nama, Number(harga || 0), Number(stok || 0));
        toast.success("Varian berhasil diperbarui");
        setEditingVarian(null);
      } else {
        await addVarian(selectedProduk.id_produk, nama, Number(harga || 0), Number(stok || 0));
        toast.success("Varian berhasil ditambahkan");
      }

      const v = await getVarianByProduk(selectedProduk.id_produk);
      setVarianList(v || []);
      setVariantForm({ nama: "", harga: "", stok: "" });
      setShowVariantModalForm(false); // 🔹 Tutup modal setelah submit
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan varian");
    }
  }

  // 🔹 Submit add-on
  async function submitAddOn(e) {
    e.preventDefault();
    const { nama, harga } = addOnForm;
    if (!nama.trim()) return toast.error("Nama add-on wajib diisi");
    try {
      if (editingAddOn) {
        await updateAddOn(editingAddOn.id_add_on, nama, Number(harga));
        toast.success("Add-on berhasil diperbarui");
        setAddOnList(prev =>
          prev.map(a => 
            a.id_add_on === editingAddOn.id_add_on 
              ? { ...a, nama_add_on: nama, harga_add_on: Number(harga) } 
              : a
          )
        );
        setEditingAddOn(null);
      } else {
        const newAddOns = await addAddOn(selectedProduk.id_produk, nama, Number(harga));
        if (!newAddOns || !Array.isArray(newAddOns) || newAddOns.length === 0) {
          throw new Error("Gagal menambahkan add-on: respons kosong dari server");
        }
        const newAddOn = newAddOns[0];
        setAddOnList(prev => [...prev, newAddOn]);
        toast.success("Add-on berhasil ditambahkan");
      }
      setAddOnForm({ nama: "", harga: "" });
      setShowAddOnModal(false); // 🔹 Tutup modal setelah submit
    } catch (err) {
      console.error("Error saat menyimpan add-on:", err);
      toast.error(err.message || "Gagal menyimpan add-on. Coba lagi.");
    }
  }

  // 🔹 Hapus add-on
  async function handleDeleteAddOn(id_add_on) {
    try {
      await deleteAddOn(id_add_on);
      toast.success("Add-on berhasil dihapus");
      setAddOnList(prev => prev.filter(x => x.id_add_on !== id_add_on));
    } catch (err) {
      toast.error(err.message || "Gagal menghapus add-on");
    }
  }
  
  const filteredProduk = produk.filter(p => {
    const matchesSearch =
        p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
        selectedCategory === "all" || p.id_kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const ProductCard = ({ p }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {p.url_gambar && p.url_gambar[0] ? (
          <Image 
            src={p.url_gambar[0]} 
            alt={p.nama_produk}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {/* Variant Count */}
        {p?.varian?.length > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#A65C37] text-white text-xs">
              {p.varian.length} varian
            </Badge>
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {p.nama_produk}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {p.deskripsi || "Tidak ada deskripsi"}
        </p>
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openVarian(p)}
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEdit(p)}
              className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                disabled={deletingProdukId === p.id_produk} // Disable saat loading
                className="w-full text-xs bg-[#A65C37] hover:bg-[#7f4629] text-white disabled:opacity-50"
              >
                {deletingProdukId === p.id_produk ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menghapus...
                  </div>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Hapus
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus {p.nama_produk}? 
                  Semua varian, add-ons, dan tanggal ready akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={deletingProdukId === p.id_produk} // Disable cancel saat loading
                  className="bg-[#E2DCD8] hover:bg-[#c7c3c1] border-black disabled:opacity-50"
                >
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteProduk(p.id_produk)}
                  disabled={deletingProdukId === p.id_produk} // Disable saat loading
                  className="bg-[#A65C37] hover:bg-[#7f4629] text-white disabled:opacity-50"
                >
                  {deletingProdukId === p.id_produk ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menghapus...
                    </div>
                  ) : (
                    "Hapus"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
  
  const ProductListItem = ({ p }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          {p.url_gambar && p.url_gambar[0] ? (
            <Image 
              src={p.url_gambar[0]} 
              alt={p.nama_produk}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-gray-300" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{p.nama_produk}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{p.deskripsi}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-[#A65C37]">
              {p?.varian?.length || 0} varian
            </span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => openVarian(p)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
            <Edit3 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                disabled={deletingProdukId === p.id_produk}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                {deletingProdukId === p.id_produk ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus {p.nama_produk}?
                  Semua varian, add-ons, dan tanggal ready akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deletingProdukId === p.id_produk}>
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteProduk(p.id_produk)}
                  disabled={deletingProdukId === p.id_produk}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {deletingProdukId === p.id_produk ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menghapus...
                    </div>
                  ) : (
                    "Hapus"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
        {/* Mobile: Jumlah produk + view toggle di satu baris */}
        <div className="flex justify-between items-center lg:hidden">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jumlah Produk: {produk.length}
          </p>
          <div className="flex items-center gap-2 rounded">
            <Button
              size="sm"
              className={`${viewMode === "grid" ? "h-8 w-8 p-0 bg-[#A65C37] hover:bg-[#A65C37]" : "bg-white text-black hover:bg-gray-100"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className={`${viewMode === "list" ? "h-8 w-8 p-0 bg-[#A65C37] hover:bg-[#A65C37]" : "bg-white text-black hover:bg-gray-100"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop: Jumlah produk saja (view toggle pindah ke kanan) */}
        <div className="hidden lg:block">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jumlah Produk: {produk.length}
          </p>
        </div>

        {/* Kontrol: Search, Filter, Tambah, View Toggle (desktop only) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white focus:dark:bg-gray-800 transition-colors"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id_kategori} value={String(cat.id_kategori)}>
                    {cat.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#A65C37] hover:bg-[#7f4629] text-white whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>

            {/* View Toggle - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 rounded">
              <Button
                size="sm"
                className={`${viewMode === "grid" ? "h-8 w-8 p-0 bg-[#A65C37] hover:bg-[#A65C37]" : "bg-white text-black hover:bg-gray-100"}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className={`${viewMode === "list" ? "h-8 w-8 p-0 bg-[#A65C37] hover:bg-[#A65C37]" : "bg-white text-black hover:bg-gray-100"}`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      
      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat produk...</span>
          </div>
        </div>
      ) : filteredProduk.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <Package className="h-12 w-12 mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm || selectedCategory ? "Produk tidak ditemukan" : "Belum ada produk"}
          </h3>
          <p className="text-sm text-center mb-4 max-w-md">
            {searchTerm || selectedCategory 
              ? "Coba ubah kata kunci pencarian atau filter kategori"
              : "Mulai dengan menambahkan produk pertama untuk toko Anda"
            }
          </p>
          {!searchTerm && !selectedCategory && (
            <Button 
              onClick={openAdd} 
              variant="outline"
              className="bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk Pertama
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProduk.map((p) => (
                <ProductCard key={p.id_produk} p={p} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProduk.map((p) => (
                <ProductListItem key={p.id_produk} p={p} />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Modal Add/Edit Produk */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {editingProduk ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitProduk} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Produk *</Label>
                <Input 
                  id="nama"
                  ref={namaRef} 
                  placeholder="Masukkan nama produk..."
                  defaultValue={editingProduk?.nama_produk || ""} 
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  disabled={submittingProduk}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori *</Label>
                <select 
                  id="kategori"
                  ref={categoryRef} 
                  defaultValue={editingProduk?.id_kategori || ""} 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={submittingProduk}
                >
                  <option value="">-- Pilih kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id_kategori} value={c.id_kategori}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea 
                id="deskripsi"
                ref={descRef} 
                placeholder="Masukkan deskripsi produk..."
                defaultValue={editingProduk?.deskripsi || ""}
                rows={4}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                disabled={submittingProduk}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gambar">Gambar Produk</Label>

              {/* Preview gambar lama (saat edit) */}
              {editingProduk && existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gambar saat ini:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image 
                          src={url} 
                          alt={`existing-${i}`} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview gambar baru yang dipilih */}
              {imagePreviews.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gambar baru yang dipilih:</p>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image 
                          src={url} 
                          alt={`preview-${i}`} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input 
                    id="gambar"
                    ref={filesRef} 
                    type="file" 
                    accept="image/png,image/jpeg,image/jpg" 
                    onChange={handleFileChange}
                    multiple 
                    className="hidden"
                    disabled={submittingProduk}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => filesRef.current?.click()}
                    className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    disabled={submittingProduk}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih Gambar (JPG/PNG)
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                * Anda dapat memilih beberapa gambar sekaligus
                {editingProduk && " - Gambar lama akan diganti dengan yang baru"}
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="bg-[#E2DCD8] border-black text-gray-800"
                disabled={submittingProduk}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={submittingProduk}
                className="bg-[#A65C37] hover:bg-[#7f4629] text-white disabled:opacity-50"
              >
                {submittingProduk ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editingProduk ? "Memperbarui..." : "Menambahkan..."}
                  </div>
                ) : (
                  editingProduk ? "Perbarui Produk" : "Tambah Produk"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal Settings - DIPERBAIKI: Form variant dihapus dari sini */}
      <Dialog 
        open={showVariantModal} 
        onOpenChange={(open) => {
          setShowVariantModal(open);
          if (!open) {
            setEditingVarian(null);
            setVariantForm({ nama: "", harga: "", stok: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Settings Produk - {selectedProduk?.nama_produk}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Existing Variants */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium flex items-center gap-2 text-gray-900">
                  <Tag className="h-4 w-4" />
                  Daftar Varian ({varianList.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={openVariantModalForm} // 🔹 DIPERBAIKI: Buka modal terpisah
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah Varian
                </Button>
              </div>
              {varianList.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Tag className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Belum ada varian untuk produk ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {varianList.map((v) => (
                    <div key={v.id_varian} className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">{v.nama_varian}</h5>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              💰 Rp {(v.harga_varian || 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📦 Stok: {v.stok_varian || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => openEditVariant(v)} // 🔹 DIPERBAIKI: Buka modal edit
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteVarian(v.id_varian)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== ADD-ONS SECTION ===== */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium flex items-center gap-2 text-gray-900">
                  <Tag className="h-4 w-4" />
                  Add-ons ({addOnList.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={openAddOnModal}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah Add-on
                </Button>
              </div>
              
              {addOnList.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 mb-2">
                    <Plus className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-sm">Belum ada add-ons untuk produk ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addOnList.map((a) => (
                    <div key={a.id_add_on} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{a.nama_add_on}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            💰 {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(a.harga_add_on)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingAddOn(a);
                              setAddOnForm({
                                nama: a.nama_add_on,
                                harga: String(a.harga_add_on)
                              });
                              setShowAddOnModal(true);
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Hapus add-on "${a.nama_add_on}"?`)) {
                                handleDeleteAddOn(a.id_add_on);
                              }
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== ATUR TANGGAL READY SECTION ===== */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Tanggal Ready ({readyDates.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={() => {
                    if (!selectedProduk) {
                      toast.error('Produk tidak ditemukan');
                      return;
                    }
                    openReadyDateModal(selectedProduk);
                  }}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Atur Tanggal
                </Button>
              </div>

              {readyDates.length === 0 ? (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  Belum ada tanggal ready diatur. Produk tidak akan muncul di menu sampai ada tanggal ready di masa depan.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {readyDates
                    .map(d => parseDate(d.tanggal))
                    .sort((a, b) => a - b)
                    .map((date, i) => {
                      const isPast = date < new Date().setHours(0, 0, 0, 0);
                      return (
                        <Badge
                          key={i}
                          variant={isPast ? "destructive" : "default"}
                          className={`text-xs px-2 py-1 ${
                            isPast 
                              ? "bg-red-100 text-red-800 hover:bg-red-200" 
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {date.toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </Badge>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔹 Modal: Tambah/Edit Add-ons Terpisah */}
      <Dialog open={showAddOnModal} onOpenChange={setShowAddOnModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              {editingAddOn ? "Edit Add-on" : "Tambah Add-on"} - {selectedProduk?.nama_produk}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={submitAddOn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addOnName">Nama Add-on *</Label>
              <Input
                id="addOnName"
                placeholder="Contoh: Extra Sambal, Telur, dll"
                value={addOnForm.nama}
                onChange={(e) => setAddOnForm({ ...addOnForm, nama: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addOnPrice">Harga Tambahan (Rp)</Label>
              <Input
                id="addOnPrice"
                type="number"
                min="0"
                placeholder="0"
                value={addOnForm.harga}
                onChange={(e) => setAddOnForm({ ...addOnForm, harga: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-[#A65C37] hover:bg-[#7f4629] text-white">
                {editingAddOn ? "Perbarui Add-on" : "Tambah Add-on"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddOnModal(false);
                  setEditingAddOn(null);
                  setAddOnForm({ nama: "", harga: "" });
                }}
                className="bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🔹 Modal: Tambah/Edit Variant Terpisah */}
      <Dialog open={showVariantModalForm} onOpenChange={setShowVariantModalForm}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              {editingVarian ? "Edit Varian" : "Tambah Varian"} - {selectedProduk?.nama_produk}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={submitVariant} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="variantName">Nama Varian *</Label>
              <Input
                id="variantName"
                placeholder="Contoh: Ukuran L, Merah, dll"
                value={variantForm.nama}
                onChange={(e) => setVariantForm({...variantForm, nama: e.target.value})}
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variantPrice">Harga</Label>
                <Input
                  id="variantPrice"
                  type="number"
                  placeholder="0"
                  value={variantForm.harga}
                  onChange={(e) => setVariantForm({...variantForm, harga: e.target.value})}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variantStock">Stok</Label>
                <Input
                  id="variantStock"
                  type="number"
                  placeholder="0"
                  value={variantForm.stok}
                  onChange={(e) => setVariantForm({...variantForm, stok: e.target.value})}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={!variantForm.nama.trim()}
                className="bg-[#A65C37] text-white hover:bg-[#7f4629]"
              >
                {editingVarian ? "Perbarui Varian" : "Tambah Varian"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowVariantModalForm(false);
                  setEditingVarian(null);
                  setVariantForm({ nama: "", harga: "", stok: "" });
                }}
                className="bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* 🔹 Modal: Atur Tanggal Ready */}
      <Dialog open={showReadyDateModal} onOpenChange={setShowReadyDateModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Atur Tanggal Ready
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Pilih satu atau lebih tanggal di masa depan
            </p>
          </DialogHeader>

          <div className="py-4">
            <DayPicker
              mode="multiple"
              selected={selectedReadyDates}
              onSelect={setSelectedReadyDates}
              // ❗ Disable tanggal masa lalu KECUALI yang sudah terpilih (supaya bisa di-unselect)
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                // Disable jika tanggal < hari ini DAN tidak ada di list selected
                // (Artinya: tanggal masa lalu yang SUDAH terpilih tetap ENABLED supaya bisa diklik untuk unselect)
                return date < today && !selectedReadyDates.some(d => d.getTime() === date.getTime());
              }}
              // Styling Tailwind yang lebih rapi
              components={{
                Footer: CustomCalendarFooter
              }}
              // Styling Tailwind yang lebih rapi
              classNames={{
                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center w-full',
                caption_label: 'text-sm font-medium',
                nav: 'hidden', // Hide default navigation
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md',
                day_selected:
                  'bg-[#A65C37] text-white hover:bg-[#A65C37] hover:text-white focus:bg-[#A65C37] focus:text-white',
                day_today: 'bg-gray-100 text-gray-900',
                day_outside: 'text-gray-300 opacity-50',
                day_disabled: 'text-gray-300 opacity-50',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
              }}
              footer={
                <div className="mt-4 text-sm text-center text-gray-700 font-medium min-h-[20px]">
                  {selectedReadyDates.length > 0 
                    ? `${selectedReadyDates.length} tanggal dipilih` 
                    : ""
                  }
                </div>
              }
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReadyDateModal(false)}
              className="bg-gray-100"
            >
              Batal
            </Button>
            <Button
              onClick={applyReadyDates}
              className="bg-[#A65C37] hover:bg-[#7f4629] text-white"
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}