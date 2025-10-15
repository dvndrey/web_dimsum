"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
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
  Upload
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

export default function ProdukTab() {
  const [produk, setProduk] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  // modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduk, setEditingProduk] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  // new state for variant editing
  const [editingVarian, setEditingVarian] = useState(null);
  // forms refs/state
  const namaRef = useRef();
  const descRef = useRef();
  const categoryRef = useRef();
  const filesRef = useRef();
  // variant form
  const [varianList, setVarianList] = useState([]);
  const [variantForm, setVariantForm] = useState({
    nama: "",
    harga: "",
    stok: ""
  });
  
  useEffect(() => {
    loadAll();
  }, []);
  
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
    setShowAddModal(true);
    setTimeout(() => {
      if (namaRef.current) namaRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = "";
      if (filesRef.current) filesRef.current.value = null;
    }, 50);
  }
  
  function openEdit(p) {
    setEditingProduk(p);
    setShowAddModal(true);
    setTimeout(() => {
      if (namaRef.current) namaRef.current.value = p.nama_produk || "";
      if (descRef.current) descRef.current.value = p.deskripsi || "";
      if (categoryRef.current) categoryRef.current.value = p.id_kategori || "";
      if (filesRef.current) filesRef.current.value = null;
    }, 50);
  }
  
  async function submitProduk(e) {
    e.preventDefault();
    const nama = namaRef.current.value.trim();
    const deskripsi = descRef.current.value.trim();
    const id_kategori = categoryRef.current.value;
    const files = filesRef.current.files ? Array.from(filesRef.current.files) : [];
    if (!nama) return toast.error("Nama produk wajib diisi");
    if (!id_kategori) return toast.error("Pilih kategori");
    try {
      if (editingProduk) {
        await updateProduk(editingProduk.id_produk, nama, deskripsi, id_kategori, files);
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
    }
  }
  
  async function handleDeleteProduk(id) {
    try {
      await deleteProduk(id);
      toast.success("Produk berhasil dihapus");
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus produk");
    }
  }
  
  async function openVarian(p) {
    setSelectedProduk(p);
    setShowVariantModal(true);
    setEditingVarian(null); // Reset saat membuka modal varian
    setVariantForm({ nama: "", harga: "", stok: "" });
    try {
      const v = await getVarianByProduk(p.id_produk);
      setVarianList(v || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat varian");
    }
  }
  
  // New function to handle variant delete
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
  
  // Updated function to handle both add and update
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
      // Reload varian list
      const v = await getVarianByProduk(selectedProduk.id_produk);
      setVarianList(v || []);
      setVariantForm({ nama: "", harga: "", stok: "" });
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan varian");
    }
  }
  
  // Filter products
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
            <Badge className="bg-blue-600 text-white text-xs">
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
              Varian
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
                className="w-full text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus {p.nama_produk}? 
                  Semua varian akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteProduk(p.id_produk)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Hapus
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
            <span className="text-xs text-blue-600">
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
              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus {p.nama_produk}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteProduk(p.id_produk)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Manajemen Produk</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{produk.length} produk tersedia</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button 
            onClick={openAdd} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white focus:dark:bg-gray-800 transition-colors"
            />
          </div>
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(cat => (
                <SelectItem key={cat.id_kategori} value={String(cat.id_kategori)}>
                    {cat.nama_kategori}
                </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
                className="px-3"
            >
                <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
                className="px-3"
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
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
              <Package className="h-5 w-5 text-green-600" />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori *</Label>
                <select 
                  id="kategori"
                  ref={categoryRef} 
                  defaultValue={editingProduk?.id_kategori || ""} 
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gambar">Gambar Produk</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input 
                    id="gambar"
                    ref={filesRef} 
                    type="file" 
                    accept="image/png,image/jpeg,image/jpg" 
                    multiple 
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => filesRef.current?.click()}
                    className="w-full bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih Gambar (JPG/PNG)
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                * Anda dapat memilih beberapa gambar sekaligus
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editingProduk ? "Perbarui Produk" : "Tambah Produk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal Varian - Diperbaiki untuk Edit/Delete */}
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
              Varian Produk - {selectedProduk?.nama_produk}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Existing Variants */}
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Tag className="h-4 w-4" />
                Daftar Varian ({varianList.length})
              </h4>
              {varianList.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Tag className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Belum ada varian untuk produk ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {varianList.map((v) => (
                    <div key={v.id_varian} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
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
                          {/* Edit Button - now has handler */}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              setEditingVarian(v);
                              setVariantForm({
                                nama: v.nama_varian,
                                harga: v.harga_varian?.toString() || "",
                                stok: v.stok_varian?.toString() || ""
                              });
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          {/* Delete Button - now has handler */}
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
            
            {/* Add New Variant */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4 text-gray-900 dark:text-white">Tambah Varian Baru</h4>
              <form onSubmit={submitVariant} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variantName">Nama Varian *</Label>
                    <Input
                      id="variantName"
                      placeholder="Contoh: Ukuran L, Merah, dll"
                      value={variantForm.nama}
                      onChange={(e) => setVariantForm({...variantForm, nama: e.target.value})}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </div>
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
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={!variantForm.nama.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingVarian ? "Perbarui Varian" : "Tambah Varian"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowVariantModal(false)}
              className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}