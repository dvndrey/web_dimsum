"use client";
import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "../../../services/orderService";
import { toast } from "sonner";

// Impor komponen shadcn/ui SATU PER SATU (sesuai contoh yang berfungsi)
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

export default function PesananTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manajemen Pesanan</h1>
            <p className="text-sm text-gray-500">{orders.length} pesanan</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Pesanan</th>
                <th className="text-left p-4 font-medium text-gray-700">Pembeli</th>
                <th className="text-left p-4 font-medium text-gray-700">Total</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-right p-4 font-medium text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status_pesanan]?.icon || Clock;
                return (
                  <tr key={order.id_pesanan} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id_pesanan.substring(0, 8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.dibuat_pada).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{order.pembeli.nama_pembeli}</div>
                      <div className="text-sm text-gray-500">{order.pembeli.nomer_pembeli}</div>
                    </td>
                    <td className="p-4 font-medium">
                      Rp{Number(order.total_harga).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <Badge className={STATUS_CONFIG[order.status_pesanan]?.color || "bg-gray-100 text-gray-800"}>
                        <StatusIcon className="h-3 w-3 mr-1 inline" />
                        {STATUS_CONFIG[order.status_pesanan]?.label || order.status_pesanan}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(order)}
                        className="text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Detail Pesanan #{selectedOrder?.id_pesanan.substring(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Info Pembeli */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Informasi Pembeli</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nama:</span>{" "}
                    <span className="font-medium">{selectedOrder.pembeli.nama_pembeli}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">No HP:</span>{" "}
                    <span className="font-medium">{selectedOrder.pembeli.nomer_pembeli}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Alamat:</span>{" "}
                    <span className="font-medium">{selectedOrder.pembeli.alamat_pembeli}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Item Pesanan</h3>
                <div className="space-y-3">
                  {selectedOrder.pesanan_item.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{item.produk.nama_produk}</div>
                        <div className="text-sm text-gray-600">{item.varian.nama_varian}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          x{item.jumlah_item} • Rp{Number(item.harga_satuan).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div className="font-medium">
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
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}