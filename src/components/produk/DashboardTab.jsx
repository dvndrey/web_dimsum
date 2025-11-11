"use client";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../../services/orderService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Package, TrendingUp, Clock, CheckCircle, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-800", icon: X },
  diproses: { label: "Diproses", color: "bg-blue-100 text-blue-800", icon: Package },
  dikirim: { label: "Dikirim", color: "bg-purple-100 text-purple-800", icon: Truck },
  selesai: { label: "Selesai", color: "bg-green-100 text-green-800", icon: CheckCircle },
};

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

export default function DashboardTab({ onViewAllOrders }) {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : summary.totalOrders}
            </div>
            <p className="text-xs text-gray-500 mt-1">Semua pesanan sejak awal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading
                ? "..."
                : `Rp${Number(summary.totalRevenue).toLocaleString("id-ID")}`}
            </div>
            <p className="text-xs text-gray-500 mt-1">Dari semua pesanan yang masuk</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pesanan Terbaru</h2>
          <Button
            className="bg-[#A65C37] hover:bg-[#7f4629]"
            size="sm"
            onClick={onViewAllOrders}
          >
            Lihat Semua
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat...</div>
        ) : summary.recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Belum ada pesanan</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#a96543] text-white">
                  <tr>
                    <th className="p-4 font-bold">Pesanan</th>
                    <th className="p-4 font-bold">Pembeli</th>
                    <th className="p-4 font-bold">Total</th>
                    <th className="p-4 font-bold">Tanggal</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentOrders.map((order) => {
                    const StatusIcon = STATUS_CONFIG[order.status_pesanan]?.icon || Clock;
                    return (
                      <tr
                        key={order.id_pesanan}
                        className="border-t text-center bg-white hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="text-sm text-gray-900">
                            #{order.id_pesanan.substring(0, 8).toUpperCase()}
                          </div>
                        </td>
                        <td className="p-4">{order.pembeli.nama_pembeli}</td>
                        <td className="p-4">
                          Rp{Number(order.total_harga).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4">
                          {formatUTCtoDateOnly(order.dibuat_pada)}
                        </td>
                        <td className="p-4">
                          <Badge
                            className={
                              STATUS_CONFIG[order.status_pesanan]?.color ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            <StatusIcon className="h-3 w-3 mr-1 inline" />
                            {STATUS_CONFIG[order.status_pesanan]?.label || order.status_pesanan}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {summary.recentOrders.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status_pesanan]?.icon || Clock;
                return (
                  <Card key={order.id_pesanan} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">
                          #{order.id_pesanan.substring(0, 8).toUpperCase()} - {formatUTCtoDateOnly(order.dibuat_pada)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Pembeli: {order.pembeli.nama_pembeli}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>Total:</span>{" "}
                          Rp{Number(order.total_harga).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <Badge
                        className={
                          STATUS_CONFIG[order.status_pesanan]?.color ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        <StatusIcon className="h-3 w-3 mr-1 inline" />
                        {STATUS_CONFIG[order.status_pesanan]?.label || order.status_pesanan}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}