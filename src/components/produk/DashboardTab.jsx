// src/components/produk/DashboardTab.jsx
"use client";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../../services/orderService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Clock, CheckCircle, Truck } from "lucide-react";

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4 text-yellow-600" />,
  diproses: <Package className="h-4 w-4 text-blue-600" />,
  dikirim: <Truck className="h-4 w-4 text-purple-600" />,
  selesai: <CheckCircle className="h-4 w-4 text-green-600" />,
};

const STATUS_LABELS = {
  pending: "Menunggu",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
};

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Total Pesanan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : summary.totalOrders}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Semua pesanan sejak awal
            </p>
          </CardContent>
        </Card>

        {/* Total Pemasukan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `Rp${Number(summary.totalRevenue).toLocaleString("id-ID")}`}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Dari semua pesanan yang masuk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pesanan Terbaru</h2>
          <Button variant="outline" size="sm" onClick={onViewAllOrders}>
            Lihat Semua
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat...</div>
        ) : summary.recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada pesanan
          </div>
        ) : (
          <div className="space-y-4">
            {summary.recentOrders.map((order) => (
              <div
                key={order.id_pesanan}
                className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm"
              >
                <div>
                  <div className="font-medium">
                    #{order.id_pesanan.substring(0, 8).toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.dibuat_pada).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    Rp{Number(order.total_harga).toLocaleString("id-ID")}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {STATUS_ICONS[order.status_pesanan] || <Clock className="h-4 w-4 text-gray-400" />}
                    <span className="text-xs text-gray-600">
                      {STATUS_LABELS[order.status_pesanan] || order.status_pesanan}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}