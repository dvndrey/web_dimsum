"use client";
import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../../services/orderService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  diproses: { label: "Diproses", color: "bg-blue-100 text-blue-800", icon: Package },
  dikirim: { label: "Dikirim", color: "bg-purple-100 text-purple-800", icon: Truck },
  selesai: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Menunggu" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
];

function formatUTCtoWIBTimeOnly(utcDateString) {
  if (!utcDateString) return "";
  const iso = utcDateString.replace(" ", "T").split(".")[0] + "Z";
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatUTCtoDateOnly(utcDateString) {
  if (!utcDateString) return "";
  const iso = utcDateString.replace(" ", "T").split(".")[0] + "Z";
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export default function PesananTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === "all" || order.status_pesanan === selectedStatus;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (order.id_pesanan?.toLowerCase() || "").includes(searchLower) ||
      (order.pembeli?.nama_pembeli?.toLowerCase() || "").includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success("Status pesanan diperbarui");
      await loadOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal memperbarui status");
    } finally {
      setUpdatingId(null);
    }
  }

  function openDetail(order) {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div>
            <p className="text-sm text-gray-500 ml-1">Total Pesanan: {orders.length} pesanan</p>
          </div>
        </div>
        {/* Header dengan Filter & Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Filter & Pencarian */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* 🔍 Pencarian */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari pesanan (ID atau nama)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

            {/* 🏷️ Filter Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#A65C37] text-white">
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 🔄 Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 w-full sm:w-auto bg-[#A65C37] text-white hover:bg-[#7f4629] hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Memuat pesanan...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada pesanan</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#a96543] text-white">
              <tr>
                <th className="p-4 font-bold">Pesanan</th>
                <th className="p-4 font-bold">Pembeli</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Tanggal</th>
                <th className="p-4 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status_pesanan]?.icon || Clock;
                return (
                  <tr key={order.id_pesanan} className="border-t text-center bg-white hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        #{order.id_pesanan.substring(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>{order.pembeli.nama_pembeli}</div>
                    </td>
                    <td className="p-4">
                      Rp{Number(order.total_harga).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <Badge className={STATUS_CONFIG[order.status_pesanan]?.color || "bg-gray-100 text-gray-800"}>
                        <StatusIcon className="h-3 w-3 mr-1 inline" />
                        {STATUS_CONFIG[order.status_pesanan]?.label || order.status_pesanan}
                      </Badge>
                    </td>
                    <td>
                      <div className="p-4">
                        {formatUTCtoDateOnly(order.dibuat_pada)}
                      </div>
                    </td>
                    <td className="p-4 flex justify-center items-center space-x-2">
                      <Select
                        value={order.status_pesanan}
                        onValueChange={(value) => handleStatusChange(order.id_pesanan, value)}
                        disabled={updatingId === order.id_pesanan}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(order)}
                        className="text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Detail Pesanan #{selectedOrder?.id_pesanan.substring(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500 ml-1">Tanggal: {formatUTCtoDateOnly(selectedOrder.dibuat_pada)}</p>
            <p className="text-sm text-gray-500 ml-1">Jam: {formatUTCtoWIBTimeOnly(selectedOrder.dibuat_pada)} WIB</p>
          </div>

            <div className="space-y-6 py-4 border-t">
              {/* Info Pembeli */}
                <h3 className="font-medium text-gray-900 mb-2">Informasi Pembeli</h3>
                <p className="text-xs text-gray-600 ml-1">*Tekan No.HP untuk menghubungi pelanggan</p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span >Nama:</span>{" "}
                    <span>{selectedOrder.pembeli.nama_pembeli}</span>
                  </div>
                  <div>
                    <span>No HP:</span>{" "}
                    <a href={`https://wa.me/${selectedOrder.pembeli.nomer_pembeli}`} target="_blank">{selectedOrder.pembeli.nomer_pembeli}</a>
                  </div>
                  <div className="md:col-span-2">
                    <span>Alamat:</span>{" "}
                    <span>{selectedOrder.pembeli.alamat_pembeli}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Item Pesanan</h3>
                <div className="space-y-3">
                  {selectedOrder.pesanan_item.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                      <div>
                        <div className="font-sm">{item.produk.nama_produk} - {item.varian.nama_varian}</div>
                        <div className="text-sm text-gray-600"></div>
                        <div className="text-xs text-gray-500 mt-1">
                          x{item.jumlah_item} • Rp{Number(item.harga_satuan).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div className="font-sm">
                        Rp{Number(item.subtotal_item).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>Rp{Number(selectedOrder.total_harga).toLocaleString("id-ID")}</span>
              </div>
            </div>

          <DialogFooter>
            <Button className="bg-[#A65C37] text-white hover:bg-[#7f4629] border-black" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}