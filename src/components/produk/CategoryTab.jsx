"use client";
import { useEffect, useState } from "react";
import { getCategory, addCategory, updateCategory, deleteCategory } from "../../../services/categoryService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit3, Trash2, Tag, Search, FolderOpen } from "lucide-react";
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

export default function CategoryTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [namaKategori, setNamaKategori] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const data = await getCategory();
      setCategories(data);
    } catch (err) {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditData(null);
    setNamaKategori("");
    setOpen(true);
  }

  function openEditModal(cat) {
    setEditData(cat);
    setNamaKategori(cat.nama_kategori);
    setOpen(true);
  }

  async function handleSubmit() {
    if (!namaKategori.trim()) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }
    try {
      if (editData) {
        await updateCategory(editData.id_kategori, namaKategori);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await addCategory(namaKategori);
        toast.success("Kategori berhasil ditambahkan");
      }
      setOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCategory(id);
      toast.success("Kategori berhasil dihapus");
      fetchCategories();
    } catch (err) {
      toast.error("Gagal menghapus kategori");
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-transparent">
      {/* Header Actions - Responsive */}
      <div className="space-y-3 md:flex justify-between items-center">
        {/* Jumlah Kategori */}
        <p className="text-sm text-gray-500">Jumlah Kategori: {categories.length}</p>

        {/* Search & Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white focus:dark:bg-gray-800 transition-colors"
            />
          </div>

          {/* Tambah Kategori Button */}
          <Button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-[#A65C37] text-white hover:bg-[#7f4629] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Kategori</span>
            <span className="sm:hidden">Tambah Kategori</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat kategori...</span>
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <FolderOpen className="h-12 w-12 mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? "Kategori tidak ditemukan" : "Belum ada kategori"}
          </h3>
          <p className="text-sm text-center mb-4 max-w-md">
            {searchTerm
              ? `Tidak ada kategori yang cocok dengan "${searchTerm}"`
              : "Mulai dengan menambahkan kategori pertama untuk mengorganisasi produk Anda"}
          </p>
          {!searchTerm && (
            <Button
              onClick={openAddModal}
              variant="outline"
              className="bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori Pertama
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#a96543] text-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id_kategori} className="text-center hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cat.nama_kategori}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(cat)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="bg-[#A65C37] text-white hover:bg-[#7f4629]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus kategori {cat.nama_kategori}? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(cat.id_kategori)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id_kategori}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {cat.nama_kategori}
                    </h4>
                  </div>
                  <div className="flex space-x-1 ml-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(cat)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 h-9 w-9"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 w-9"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kategori {cat.nama_kategori}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-[#E2DCD8] border-black text-gray-800">Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cat.id_kategori)}
                            className="bg-[#A65C37] text-white hover:bg-[#7f4629]"
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal Tambah/Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              {editData ? "Edit Kategori" : "Tambah Kategori"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kategori">Nama Kategori</Label>
              <Input
                id="kategori"
                placeholder="Masukkan nama kategori..."
                value={namaKategori}
                onChange={(e) => setNamaKategori(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full bg-white border-gray-300"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="bg-[#E2DCD8] border-black text-gray-800"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!namaKategori.trim()}
              className="bg-[#A65C37] hover:bg-[#7f4629] text-white"
            >
              {editData ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}