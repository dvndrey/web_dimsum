'use client';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import NavbarTab from '@/components/User/NavbarTab';
import Footer from '@/components/User/Footer';
import { getAddOnsByProduk } from '../../services/addOnService';
import { getProduk } from '../../services/productService';
import { getVarianByProduk } from '../../services/variantService';
import { createOrder } from '../../services/orderService';
import { getReadyDates } from '../../services/readyService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOwnerData } from '../../services/ownService';

// 🔹 Cache untuk data varian & add-ons
const variantCache = new Map();
const addOnCache = new Map();

// 🔹 Cache untuk ready dates (mirip variantCache & addOnCache)
const readyDateCache = new Map();

export default function HomePage() {
  // 🔹 State navigasi
  const [activeView, setActiveView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔹 Data
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Hero Section: owner data
  const [ownerData, setOwnerData] = useState(null);

  // 🔹 Modal produk
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalVariants, setModalVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});

  // 🔹 Ready dates untuk produk yang dipilih
  const [selectedProductReadyDates, setSelectedProductReadyDates] = useState([]);

  // 🔹 Modal add-ons (dipilih per varian)
  const [modalAddOns, setModalAddOns] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState({}); // { id_varian: { id_add_on: jumlah } }

  // 🔹 Modal gambar
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // 🔹 Keranjang
  const [cartItems, setCartItems] = useState([]);

  // 🔹 Mobile price summary toggle
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // 🔹 Modal Konfirmasi Pesanan
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pembeliData, setPembeliData] = useState({
    nama_pembeli: '',
    alamat_pembeli: '',
    nomer_pembeli: '',
    metode_pengambilan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ✅ Format rupiah dengan useCallback
  const formatRupiah = useCallback((angka) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka), []);

  // ✅ Load data produk, keranjang, & owner (hero)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [produkData, ownerData] = await Promise.all([
          getProduk(),
          getOwnerData()
        ]);
        setProduk(produkData);
        setOwnerData(ownerData);

        // 🔹 Prefetch varian & add-ons untuk 3 produk pertama (optimasi)
        if (produkData.length > 0) {
          produkData.slice(0, 3).forEach(product => {
            getVarianByProduk(product.id_produk).then(variants => {
              variantCache.set(product.id_produk, variants);
            });
            getAddOnsByProduk(product.id_produk).then(addOns => {
              addOnCache.set(product.id_produk, addOns);
            });
          });
        }
      } catch (err) {
        console.error('Gagal fetch data:', err);
        if (!err?.message?.includes('owner')) {
          setError('Gagal memuat menu.');
          toast.error('Gagal memuat menu');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Load cart dari localStorage
    const savedCart = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('cart') || '[]') 
      : [];
    setCartItems(savedCart);
  }, []);

  // ✅ Sinkronisasi keranjang ke localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ✅ Switch view dengan useCallback
  const switchView = useCallback((view) => {
    if (['home', 'menu', 'cart'].includes(view)) {
      setActiveView(view);
      setIsMobileSummaryOpen(false);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }, []);

  // ✅ Buka modal produk - OPTIMIZED: gunakan cache
  const openVariantModal = useCallback(async (product) => {
    try {
      setModalLoading(true);
      setSelectedProduct(product);
      setSelectedVariants({});
      setSelectedAddOns({});

      // 🔹 Ambil varian (pakai cache)
      let variants = variantCache.get(product.id_produk);
      if (!variants) {
        variants = await getVarianByProduk(product.id_produk);
        variantCache.set(product.id_produk, variants);
      }
      setModalVariants(variants);

      // 🔹 Ambil add-ons (pakai cache)
      let addOns = addOnCache.get(product.id_produk);
      if (!addOns) {
        addOns = await getAddOnsByProduk(product.id_produk);
        addOnCache.set(product.id_produk, addOns);
      }
      setModalAddOns(addOns);

      // 🔹 🔹 🔹 AMBIL READY DATES — BARU!
      let readyDates = readyDateCache.get(product.id_produk);
      if (!readyDates) {
        readyDates = await getReadyDates(product.id_produk);
        readyDateCache.set(product.id_produk, readyDates);
      }
      setSelectedProductReadyDates(readyDates);

      setIsModalOpen(true);
    } catch (err) {
      console.error('Gagal memuat varian/add-ons/ready dates:', err);
      toast.error('Gagal memuat data produk');
    } finally {
      setModalLoading(false);
    }
  }, []);

  const closeVariantModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedVariants({});
    setSelectedAddOns({});
    setSelectedProductReadyDates([]);
  }, []);

  // ✅ Update jumlah varian di modal
  const updateVariantQuantity = useCallback((id_varian, change) => {
    setSelectedVariants(prev => {
      const current = prev[id_varian] || 0;
      const newQty = Math.max(0, current + change);
      const newState = { ...prev };
      if (newQty === 0) {
        delete newState[id_varian];
      } else {
        newState[id_varian] = newQty;
      }
      return newState;
    });
  }, []);

  // ✅ Update jumlah add-on per varian (maks 1 per jenis)
  const updateAddOnQuantity = useCallback((id_varian, id_add_on, change) => {
    setSelectedAddOns(prev => {
      const current = prev[id_varian] || {};
      let newQty = (current[id_add_on] || 0) + change;

      // Batas maksimal 1 per jenis add-on
      if (newQty < 0) newQty = 0;
      if (newQty > 1) newQty = 1;

      const newState = { ...prev };
      if (newQty === 0) {
        // Hapus jika 0
        const updated = { ...current };
        delete updated[id_add_on];
        newState[id_varian] = Object.keys(updated).length > 0 ? updated : undefined;
      } else {
        // Simpan qty
        newState[id_varian] = { ...current, [id_add_on]: newQty };
      }
      return newState;
    });
  }, []);

  // ✅ Tambah ke keranjang dengan toast
  const addToCart = useCallback(() => {
    if (Object.keys(selectedVariants).length === 0) {
      toast.error('Pilih varian terlebih dahulu');
      return;
    }

    const newItems = Object.entries(selectedVariants).map(([id_varian, qty]) => {
      const variant = modalVariants.find(v => v.id_varian == id_varian);
      
      // 🔹 Ambil add-ons untuk varian ini — dari struktur { id_add_on: jumlah }
      const addOnsForThisVariant = Object.entries(selectedAddOns[id_varian] || {})
        .filter(([_, q]) => q > 0) // hanya yang qty > 0
        .map(([id_add_on, jumlah]) => {
          const aoMeta = modalAddOns.find(a => a.id_add_on === id_add_on);
          return {
            id_add_on: id_add_on,
            nama_add_on: aoMeta?.nama_add_on || '',
            harga_add_on: aoMeta?.harga_add_on || 0,
            jumlah: jumlah // selalu 1, karena kita batasi max 1
          };
        });

      // ✅ Hitung subtotal termasuk add-ons
      let hargaDasar = variant?.harga_varian || 0;
      let totalAddOns = addOnsForThisVariant.reduce((sum, ao) => sum + (ao.harga_add_on * ao.jumlah), 0);
      let hargaTotalPerItem = hargaDasar + totalAddOns;

      return {
        id: `${selectedProduct.id_produk}-${id_varian}-${Date.now()}`,
        id_produk: selectedProduct.id_produk,
        id_varian: id_varian,
        nama_produk: selectedProduct.nama_produk,
        nama_varian: variant?.nama_varian,
        url_gambar: Array.isArray(selectedProduct.url_gambar)
          ? selectedProduct.url_gambar[0]
          : selectedProduct.url_gambar || '/placeholder.jpg',
        harga: hargaDasar, // harga dasar varian
        jumlah: qty,
        subtotal: hargaTotalPerItem * qty,
        // 🔹 Simpan add-ons
        add_ons: addOnsForThisVariant // array
      };
    });

    setCartItems(prev => [...prev, ...newItems]);
    const totalItems = newItems.reduce((sum, item) => sum + item.jumlah, 0);
    toast.success(`${totalItems} item berhasil ditambahkan ke keranjang`);
    closeVariantModal();
  }, [selectedVariants, selectedAddOns, modalVariants, modalAddOns, selectedProduct, closeVariantModal]);

  // ✅ Hitung subtotal & total dengan useMemo
  const { subtotal, total } = useMemo(() => {
    const subtotalValue = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      subtotal: subtotalValue,
      total: subtotalValue
    };
  }, [cartItems]);

  // ✅ Update jumlah item di keranjang
  const updateCartQuantity = useCallback((id, change) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              jumlah: Math.max(1, item.jumlah + change),
              subtotal: item.harga * Math.max(1, item.jumlah + change)
            }
          : item
      ).filter(item => item.jumlah > 0)
    );
  }, []);

  const removeCartItem = useCallback((id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item dihapus dari keranjang');
  }, []);

  // ✅ Filter produk dengan useMemo
  const { kategoriList, filteredProduk } = useMemo(() => {
    const kategoriList = ['Semua', ...new Set(produk.map(p => p.kategori?.nama_kategori).filter(Boolean))];
    const filteredProduk = produk.filter(p => {
      const matchCategory = activeCategory === 'Semua' || p.kategori?.nama_kategori === activeCategory;
      const matchSearch = !searchQuery.trim() || 
        p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.deskripsi && p.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
    return { kategoriList, filteredProduk };
  }, [produk, activeCategory, searchQuery]);

  // ✅ Subtotal di modal
  const { modalSubtotal, totalModalItems } = useMemo(() => {
    const modalSubtotal = Object.entries(selectedVariants).reduce((total, [id_varian, qty]) => {
      const variant = modalVariants.find(v => v.id_varian == id_varian);
      return total + (variant?.harga_varian || 0) * qty;
    }, 0);
    const totalModalItems = Object.values(selectedVariants).reduce((sum, q) => sum + q, 0);
    return { modalSubtotal, totalModalItems };
  }, [selectedVariants, modalVariants]);

  // ✅ Buka modal konfirmasi
  const openConfirmModal = useCallback(() => {
    if (cartItems.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    setIsMobileSummaryOpen(false);
    setPembeliData({
      nama_pembeli: '',
      alamat_pembeli: '',
      nomer_pembeli: '',
      metode_pengambilan: ''
    });
    setFormError('');
    setIsConfirmModalOpen(true);
  }, [cartItems.length]);

  const closeConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(false);
  }, []);

  // ✅ Mobile Summary Handlers
  const openMobileSummary = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsMobileSummaryOpen(true);
  }, []);

  const closeMobileSummary = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsMobileSummaryOpen(false);
  }, []);

  // ✅ Handle submit order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const { nama_pembeli, alamat_pembeli, nomer_pembeli, metode_pengambilan } = pembeliData;
    if (!nama_pembeli.trim() || !alamat_pembeli.trim() || !nomer_pembeli.trim() || !metode_pengambilan) {
      setFormError('Semua field wajib diisi.');
      setIsSubmitting(false);
      toast.error('Harap isi semua field yang wajib');
      return;
    }

    // ✅ Validasi panjang minimal 12 digit angka pada nomor WhatsApp
    const cleanPhone = nomer_pembeli.replace(/\D/g, '');
    if (cleanPhone.length < 12) {
      setFormError('Nomor WhatsApp minimal 12 digit angka.');
      toast.error('Harap masukkan nomor WhatsApp yang valid (minimal 12 digit).');
      setIsSubmitting(false);
      return;
    }

    let formattedNomer = nomer_pembeli.replace(/\D/g, '');
    if (formattedNomer.startsWith('0')) {
      formattedNomer = '62' + formattedNomer.slice(1);
    } else if (!formattedNomer.startsWith('62')) {
      if (formattedNomer.length >= 10 && formattedNomer.length <= 12) {
        formattedNomer = '62' + formattedNomer;
      }
    }

    try {
      const owner = await getOwnerData();
      const ownerPhone = owner?.no_hp || '+6285169901919';
      const formattedOwnerPhone = ownerPhone
        .replace(/[^0-9+]/g, '')
        .replace(/^0/, '+62');

      const orderItems = cartItems.map(item => ({
        id_produk: item.id_produk,
        id_varian: item.id_varian,
        jumlah_item: item.jumlah,
        harga_satuan: item.harga,
      }));

      await createOrder(
        { nama_pembeli, alamat_pembeli, nomer_pembeli: formattedNomer },
        orderItems
      );

      toast.success('Pesanan berhasil dibuat, membuka WhatsApp...');

      let message = `Hai kak! Saya ingin memesan produk berikut:\n`;
      cartItems.forEach((item) => {
        message += `• ${item.nama_produk} (${item.nama_varian}) ×${item.jumlah}\n`;
        // 🔹 Tambahkan add-ons
        if (item.add_ons?.length) {
          item.add_ons.forEach(ao => {
            message += `   + ${ao.nama_add_on} ×${ao.jumlah}\n`;
          });
        }
      });
      message += `\n`;
      message += `Nama: ${nama_pembeli}\n`;
      message += `No. WhatsApp: ${formattedNomer}\n`;
      message += `Alamat: ${alamat_pembeli}\n`;
      message += `Metode Pengambilan: ${metode_pengambilan}\n`;

      const encoded = encodeURIComponent(message);
      const waLink = `https://api.whatsapp.com/send?phone=${formattedOwnerPhone}&text=${encoded}`;
      window.location.href = waLink;

      setCartItems([]);
      closeConfirmModal();
    } catch (err) {
      console.error('Error membuat pesanan:', err);
      setFormError('Gagal menyimpan pesanan. Coba lagi.');
      toast.error('Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-montserrat min-h-screen flex flex-col">
      <NavbarTab activeView={activeView} onSwitchView={switchView} />
      <main className="flex-grow pb-32 md:pb-20">
        {/* Home View */}
        {activeView === 'home' && (
          <>
            {/* Hero Section — DINAMIS */}
            <section className="relative w-full h-[750px] overflow-hidden">
              <Image
                src="/Images/BannerBackground.jpg"
                alt="Banner"
                fill
                className="absolute inset-0 object-cover brightness-65"
                style={{ filter: 'blur(7px)' }}
                priority
                sizes="100vw"
              />
              <div className="relative z-10 flex flex-col items-center justify-center text-white h-full px-4 text-center text-shadow-lg">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight whitespace-pre-line">
                  {ownerData?.hero_title || "Nikmati Cita Rasa"}<br />
                  {(ownerData?.hero_subtitle || "Dimsum Rumahan\ndengan Rasa Premium")
                    .split('\n')
                    .map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl text-shadow-lg">
                  Kami percaya rasa terbaik lahir dari sentuhan tangan dan ketulusan hati.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => switchView('menu')}
                    className="bg-gray-200 text-gray-800 hover:bg-white hover:scale-105 font-medium py-3 px-6 rounded-full cursor-pointer transition active:scale-95"
                  >
                    Lihat Menu
                  </button>
                </div>
              </div>
            </section>

            {/* Kenapa Memilih Kami? */}
            <section className="py-16 bg-white px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-medium text-center mb-12">Kenapa Memilih Kami?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: '/Icons/MoneyIcon.png', title: 'Bayar Saat Pesanan Tiba', desc: 'Pesan tanpa khawatir — nikmati dulu kelezatannya, lalu bayar setelah pesanan sampai.' },
                    { icon: '/Icons/PercentIcon.png', title: 'Kepuasan Pelanggan Utama Kami', desc: 'Kami selalu berusaha memberikan rasa dan pelayanan terbaik.' },
                    { icon: '/Icons/FindIcon.png', title: 'Resep Asli Rumahan', desc: 'Menunjukkan kehangatan dan ketulusan dalam proses pembuatan.' },
                    { icon: '/Icons/QualityIcon.png', title: 'Kualitas Terjamin, Rasa Konsisten', desc: 'Kami menjaga setiap proses agar rasa dimsum kami selalu sama.' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-xl transition-shadow">
                      <div className="w-16 h-16 mb-4 flex items-center justify-center">
                        <Image src={item.icon} alt={item.title} width={48} height={48} className="object-contain" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Special Menu Preview */}
            <section className="py-10 bg-white px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-4xl font-medium text-center text-gray-800 mb-8">
                  Nikmati berbagai pilihan menu spesial kami!
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {produk.slice(0, 4).map(item => (
                    <div key={item.id_produk} className="bg-white rounded-xl overflow-hidden shadow-sm transition hover:shadow-md">
                      <div className="relative h-48 w-full">
                        <Image
                          src={Array.isArray(item.url_gambar) ? (item.url_gambar[0] || '/placeholder.jpg') : item.url_gambar}
                          alt={item.nama_produk}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-800">{item.nama_produk}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="py-12 px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="bg-yellow-50 p-8 rounded-xl border-2 border-orange-900">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                    Jelajahi Beragam Menu Kami
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Dimsum buatan tangan dengan rasa rumahan yang autentik,<br />
                    dibuat dengan sepenuh hati untuk Anda.
                  </p>
                  <button
                    onClick={() => switchView('menu')}
                    className="bg-[#A65C37] hover:bg-[#d36e3b] text-white font-medium py-2 px-6 rounded-full transition active:scale-95 cursor-pointer"
                  >
                    Lihat Semua Menu
                  </button>
                </div>
              </div>
            </section>

            {/* Outlet */}
            <section className="py-16 bg-white px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">Outlet Kami</h2>
                <p className="text-gray-600 mb-8 text-center">Tersedia layanan COD & Delivery ke area sekitar.</p>
                <div className="relative border-2 rounded-xl border-[#A65C37] overflow-hidden shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.1624248175176!2d110.82885447562668!3d-7.55726227462661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a1717b4faa015%3A0x4cbe254bef4031fe!2sSay%20Endulque!5e0!3m2!1sen!2sid!4v1762233743686!5m2!1sen!2sid"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Outlet"
                  ></iframe>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Menu View */}
        {activeView === 'menu' && (
          <section className="py-12 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Menu Kami</h1>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  {loading ? 'Memuat menu...' : error ? 'Gagal memuat menu.' : 'Nikmati berbagai hidangan lezat.'}
                </p>
              </div>

              {!loading && !error && (
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="flex flex-wrap justify-center gap-3">
                    {kategoriList.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          setActiveCategory(category);
                          setSearchQuery('');
                        }}
                        className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                          activeCategory === category
                            ? 'bg-[#A65C37] text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        } active:scale-95`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <div className="w-full max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={`Cari di kategori "${activeCategory}"...`}
                        className="w-full px-4 py-2.5 pl-10 pr-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-[#A65C37] outline-none transition-all"
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#A65C37] border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Memuat menu...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#A65C37] text-white rounded-full transition active:scale-95">
                    Coba Lagi
                  </button>
                </div>
              )}

              {!loading && !error && filteredProduk.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {filteredProduk.map(item => {
                    const gambar = Array.isArray(item.url_gambar)
                      ? item.url_gambar[0]
                      : item.url_gambar || '/placeholder.jpg';
                    const isMatchSearch = searchQuery.trim() !== '' && 
                      item.nama_produk.toLowerCase().includes(searchQuery.toLowerCase());
                    return (
                      <div
                        key={item.id_produk}
                        className={`bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all ${
                          isMatchSearch ? 'ring-2 ring-[#A65C37] bg-[#A65C37]/5' : ''
                        }`}
                      >
                        <div className="relative h-48 w-full">
                          <Image 
                            src={gambar} 
                            alt={item.nama_produk} 
                            fill 
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-4 flex flex-col justify-between h-[160px]">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.nama_produk}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.deskripsi}</p>
                          </div>
                          <div className="flex justify-center mt-auto">
                            <button
                              onClick={() => openVariantModal(item)}
                              className="bg-[#A65C37] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#d36e3b] transition active:scale-95 cursor-pointer"
                            >
                              Lihat Produk
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && !error && filteredProduk.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Tidak ada menu untuk kategori dan kata kunci ini.
                </div>
              )}
            </div>
          </section>
        )}

        {/* Cart View */}
        {activeView === 'cart' && (
          <section className="py-8 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Keranjang Kamu</h1>
                <span className="text-sm text-gray-600">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Keranjangmu masih kosong</h3>
                  <p className="text-gray-600 mb-6">Yuk tambahkan menu favoritmu!</p>
                  <button
                    onClick={() => switchView('menu')}
                    className="bg-[#A65C37] hover:bg-[#d36e3b] text-white font-medium py-2 px-6 rounded-full transition active:scale-95"
                  >
                    Lihat Menu
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-start gap-4">
                        <div className="w-20 h-20 flex-shrink-0 relative">
                          <Image 
                            src={item.url_gambar} 
                            alt={item.nama_varian} 
                            fill 
                            className="object-cover rounded-md"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900">{item.nama_produk}</h3>
                          <p className="text-sm text-gray-600">Varian {item.nama_varian}</p>
                          {/* 🔹 Tampilkan add-ons di keranjang */}
                          {item.add_ons?.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500 space-y-1">
                              {item.add_ons.map((ao, idx) => (
                                <div key={idx}>+ {ao.nama_add_on} ×{ao.jumlah}</div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-[#A65C37]">{formatRupiah(item.harga)}</span>
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-2 py-1">
                              <button 
                                onClick={() => updateCartQuantity(item.id, -1)} 
                                className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded active:scale-95"
                              >
                                −
                              </button>
                              <span className="text-sm font-medium w-6 text-center">{item.jumlah}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.id, 1)} 
                                className="w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded active:scale-95"
                              >
                                +
                              </button>
                            </div>
                            <button 
                              onClick={() => removeCartItem(item.id)} 
                              className="text-red-500 hover:text-red-700 text-sm font-medium active:scale-95"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Summary */}
                  <div className="lg:col-span-1">
                    <div className="hidden md:block bg-white p-6 rounded-lg shadow-sm sticky top-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Order</h2>
                      <div className="space-y-3 mb-4">
                        {cartItems.map(item => (
                          <div key={item.id} className="flex justify-between py-2 border-b border-gray-100">
                            <div className="flex flex-col">
                              <span className="font-medium">{item.nama_produk}</span>
                              <span className="text-sm text-gray-600">Varian: {item.nama_varian}</span>
                                {item.add_ons?.length > 0 && (
                                  <div className="mt-1 text-xs text-gray-500 space-y-1">
                                    {item.add_ons.map((ao, idx) => (
                                      <div key={idx}>+ {ao.nama_add_on} ×{ao.jumlah}</div>
                                    ))}
                                  </div>
                                )}
                              <span className="text-sm text-gray-600">Jumlah: x{item.jumlah}</span>
                            </div>
                            <div className="text-right">
                              <span className="block">Harga/item: {formatRupiah(item.harga)}</span>
                              <span className="font-bold">Subtotal: {formatRupiah(item.subtotal)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-bold">{formatRupiah(subtotal)}</span>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>{formatRupiah(total)}</span>
                        </div>
                      </div>
                      <button
                        onClick={openConfirmModal}
                        className="w-full mt-6 bg-[#A65C37] hover:bg-[#d36e3b] text-white font-medium py-3 rounded-full transition active:scale-95"
                      >
                        Buat Pesanan
                      </button>
                    </div>

                    {/* Mobile Sticky Bottom */}
                    <div className="md:hidden fixed bottom-15 left-0 right-0 z-40 bg-white p-4 rounded-t-lg shadow-lg border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="text-xl font-bold text-gray-900">{formatRupiah(total)}</div>
                        </div>
                        <button
                          onClick={openMobileSummary}
                          className="bg-[#A65C37] text-white font-medium py-3 px-6 rounded-full active:scale-95"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>

                    {/* Mobile Expanded Detail */}
                    {isMobileSummaryOpen && (
                      <>
                        <div 
                          className="md:hidden fixed inset-0 z-50 bg-black/50"
                          onClick={closeMobileSummary}
                        />
                        <div
                          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 text-lg">Ringkasan Pesanan</h3>
                            <button
                              onClick={closeMobileSummary}
                              className="text-gray-500 hover:text-gray-700 p-2 active:scale-95"
                              aria-label="Tutup detail"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="p-4 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-3 mb-4">
                              {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                                  <div className="flex flex-col flex-1">
                                    <span className="font-medium text-sm text-gray-900">{item.nama_produk}</span>
                                    <span className="text-xs text-gray-600">Varian: {item.nama_varian}</span>
                                      {item.add_ons?.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500 space-y-1">
                                          {item.add_ons.map((ao, idx) => (
                                            <div key={idx}>+ {ao.nama_add_on} ×{ao.jumlah}</div>
                                          ))}
                                        </div>
                                      )}
                                    <span className="text-xs text-gray-500">x{item.jumlah}</span>
                                  </div>
                                  <div className="text-right ml-4">
                                    <span className="block font-medium text-sm text-[#A65C37]">
                                      {formatRupiah(item.subtotal)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Subtotal</span>
                                <span className="font-medium">{formatRupiah(subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-base font-bold text-gray-900 mt-2">
                                <span>Total</span>
                                <span>{formatRupiah(total)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                              onClick={() => {
                                closeMobileSummary();
                                openConfirmModal();
                              }}
                              className="w-full bg-[#A65C37] hover:bg-[#d36e3b] text-white font-medium py-3 rounded-lg text-sm transition active:scale-95"
                            >
                              Buat Pesanan
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30 animate-in fade-in duration-200" 
            onClick={closeVariantModal} 
          />
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-.416 1.088-.416 1.514 0L12 4.5l.169.169m-1.316 6.842a1.5 1.5 0 112.688 0 1.5 1.5 0 01-2.688 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.769 4H5.231C3.995 4 3 5.005 3 6.24v11.52c0 1.235.995 2.24 2.231 2.24h14.538c1.236 0 2.231-1.005 2.231-2.24V6.24C22 5.005 21.005 4 19.769 4z" />
                  </svg>
                  Detail {selectedProduct.nama_produk}
                </h3>
                <button onClick={closeVariantModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold active:scale-95">×</button>
              </div>

              <div className="flex flex-col md:flex-row max-h-[70vh] overflow-y-auto">
                <div className="flex-shrink-0 w-full md:w-1/2 p-4 bg-gray-50 flex flex-col items-center md:items-start">
                  <div className="relative w-full h-64 md:h-72 mb-4">
                    <Image
                      src={Array.isArray(selectedProduct.url_gambar) ? selectedProduct.url_gambar[0] || '/placeholder.jpg' : selectedProduct.url_gambar || '/placeholder.jpg'}
                      alt={selectedProduct.nama_produk}
                      fill
                      className="object-cover rounded-lg cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute bottom-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow active:scale-95"
                      aria-label="Lihat gambar penuh"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                  <h4 className="text-lg font-bold mb-2">{selectedProduct.nama_produk}</h4>
                  {selectedProduct.deskripsi && <p className="text-sm text-gray-700 text-center md:text-left mb-4">{selectedProduct.deskripsi}</p>}

                  {/* 🔹 TANGGAL READY — DI BAWAH DESKRIPSI */}
                  {selectedProductReadyDates.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {selectedProductReadyDates
                          .map(d => ({
                            ...d,
                            dateObj: new Date(d.tanggal)
                          }))
                          .sort((a, b) => a.dateObj - b.dateObj)
                          .map((item, idx) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isPast = item.dateObj < today;

                            // Format: Sen, 27 Nov
                            const formatted = item.dateObj.toLocaleDateString('id-ID', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short'
                            });

                            return (
                              <span
                                key={item.id_ready || idx}
                                className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                                  isPast
                                    ? 'bg-red-100 text-red-800 line-through'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                📅 {formatted}
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-grow p-4 border-t md:border-l border-gray-200">
                  <h5 className="text-sm font-medium text-gray-600 mb-3">
                    {modalLoading ? 'Memuat varian...' : `Varian (${modalVariants.length})`}
                  </h5>
                  {modalLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#A65C37] border-r-transparent"></div>
                    </div>
                  ) : modalVariants.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Belum ada varian tersedia.</p>
                  ) : (
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                      {modalVariants.map(variant => {
                        const qty = selectedVariants[variant.id_varian] || 0;
                        const addOnsForThisVariant = selectedAddOns[variant.id_varian] || {};
                        return (
                          <div key={variant.id_varian} className={`p-3 rounded-lg border transition-all ${
                            variant.stok_varian <= 0 
                              ? 'bg-gray-100 border-gray-300 text-gray-500' 
                              : qty > 0 
                                ? 'bg-[#ededed] border-[#d36e3b]' 
                                : 'border-gray-200 hover:bg-slate-200'
                          }`}>
                            <div className="flex justify-between">
                              <div>
                                <h5 className="font-medium">{variant.nama_varian}</h5>
                                <p className="text-xs text-gray-500 mt-1">Stok: {variant.stok_varian}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[#A65C37]">
                                  Rp {variant.harga_varian?.toLocaleString('id-ID')}
                                </p>
                                {variant.stok_varian > 0 && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <button 
                                      onClick={() => updateVariantQuantity(variant.id_varian, -1)} 
                                      className="w-6 h-6 flex items-center justify-center bg-white border rounded active:scale-95"
                                    >
                                      −
                                    </button>
                                    <span className="w-6 text-center">{qty}</span>
                                    <button 
                                      onClick={() => updateVariantQuantity(variant.id_varian, 1)} 
                                      disabled={qty >= variant.stok_varian}
                                      className={`w-6 h-6 flex items-center justify-center bg-white border rounded active:scale-95 ${qty >= variant.stok_varian ? 'opacity-50' : ''}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ✅ Add-ons Section — HANYA DI SINI (langsung di bawah tombol +/-) */}
                            {qty > 0 && modalAddOns.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h6 className="text-sm font-medium text-gray-600 mb-2">
                                  Tambahkan Pelengkap (1 pilihan)
                                </h6>
                                <div className="space-y-2">
                                  {modalAddOns.map(addOn => {
                                    // ✅ Gunakan akses object langsung — TIDAK PAKAI .find()
                                    const currentQty = addOnsForThisVariant[addOn.id_add_on] || 0;

                                    return (
                                      <div key={addOn.id_add_on} className="flex justify-between items-center py-1">
                                        <div className="flex-1">
                                          <h6 className="font-medium text-gray-900">{addOn.nama_add_on}</h6>
                                          <p className="text-xs text-gray-500">+{formatRupiah(addOn.harga_add_on)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button 
                                            onClick={() => updateAddOnQuantity(variant.id_varian, addOn.id_add_on, -1)} 
                                            className={`w-6 h-6 flex items-center justify-center bg-white border rounded active:scale-95 ${
                                              currentQty === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            disabled={currentQty === 0}
                                          >
                                            −
                                          </button>
                                          <span className="w-6 text-center">{currentQty}</span>
                                          <button 
                                            onClick={() => updateAddOnQuantity(variant.id_varian, addOn.id_add_on, 1)} 
                                            className={`w-6 h-6 flex items-center justify-center bg-white border rounded active:scale-95 ${
                                              currentQty >= 1 ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                            disabled={currentQty >= 1}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {totalModalItems > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-bold">{formatRupiah(modalSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Total Item:</span>
                        <span className="font-bold">{totalModalItems} item</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-center gap-3">
                <button 
                  onClick={addToCart} 
                  className="px-5 py-2 bg-[#A65C37] text-white rounded-lg text-sm font-medium hover:bg-[#d36e3b] transition active:scale-95"
                >
                  Tambah Ke Keranjang
                </button>
                <button 
                  onClick={closeVariantModal} 
                  className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>

          {/* Image Modal */}
          {isImageModalOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 animate-in fade-in duration-200" onClick={() => setIsImageModalOpen(false)}>
              <div className="relative max-w-[95vw] max-h-[95vh] rounded-lg bg-white" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => setIsImageModalOpen(false)} 
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/70 rounded-full active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center justify-center p-2">
                  <Image
                    src={Array.isArray(selectedProduct?.url_gambar) ? selectedProduct.url_gambar[0] || '/placeholder.jpg' : selectedProduct?.url_gambar || '/placeholder.jpg'}
                    alt={selectedProduct?.nama_produk}
                    width={800} height={600}
                    className="max-h-[85vh] max-w-[90vw] object-contain rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm Order Modal */}
      {isConfirmModalOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/40 animate-in fade-in duration-200" 
            onClick={closeConfirmModal}
          />
          <div 
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto animate-in fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Konfirmasi Pesanan</h3>
                <button 
                  onClick={closeConfirmModal}
                  className="text-gray-500 hover:text-gray-700 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95"
                  aria-label="Tutup"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={pembeliData.nama_pembeli}
                    onChange={e => setPembeliData(prev => ({ ...prev, nama_pembeli: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A65C37] focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={pembeliData.nomer_pembeli}
                    onChange={e => {
                      const rawValue = e.target.value;
                      setPembeliData(prev => ({ ...prev, nomer_pembeli: rawValue }));
                    }}
                    onBlur={() => {
                      const cleaned = pembeliData.nomer_pembeli.replace(/\D/g, '');
                      if (cleaned.length >= 1 && cleaned.length < 12 && cleaned !== '') {
                        toast.error('Nomor WhatsApp minimal 12 digit angka.');
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A65C37] outline-none transition-all ${
                      pembeliData.nomer_pembeli.replace(/\D/g, '').length > 0 && pembeliData.nomer_pembeli.replace(/\D/g, '').length < 12
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Contoh: 081234567890"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Masukkan minimal 12 digit angka (contoh: 081234567890 atau +6281234567890).
                  </p>
                  {pembeliData.nomer_pembeli.replace(/\D/g, '').length > 0 && pembeliData.nomer_pembeli.replace(/\D/g, '').length < 12 && (
                    <p className="text-xs text-red-500 mt-1">
                      ❗ Nomor harus minimal 12 digit angka.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    value={pembeliData.alamat_pembeli}
                    onChange={e => setPembeliData(prev => ({ ...prev, alamat_pembeli: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A65C37] focus:border-transparent outline-none resize-none transition-all"
                    placeholder="Contoh: Jl. Merdeka No. 45, RT 02/RW 03, Kel. Sukamaju, Kec. Kota Baru"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Termasuk nama jalan, RT/RW, kelurahan, kecamatan, dan kota.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Metode Pengambilan *
                  </label>
                  <Select
                    value={pembeliData.metode_pengambilan}
                    onValueChange={value =>
                      setPembeliData(prev => ({ ...prev, metode_pengambilan: value }))
                    }
                  >
                    <SelectTrigger className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-[#A65C37] focus:border-transparent">
                      <SelectValue placeholder="Pilih metode..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#A65C37] border border-[#3a2921] text-white rounded-lg">
                      <SelectItem value="COD">COD (Bayar di Tempat)</SelectItem>
                      <SelectItem value="Self Pick Up">Self Pick Up (Ambil Sendiri)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-gray-800 mb-1">Pesanan Anda:</p>
                  <ul className="space-y-1">
                    {cartItems.map(item => (
                      <li key={item.id} className="text-gray-700">
                        • {item.nama_produk} ({item.nama_varian}) ×{item.jumlah}
                        {item.add_ons?.map(ao => (
                          <span key={ao.id_add_on} className="block text-xs text-gray-600 ml-4 mt-0.5">
                            + {ao.nama_add_on} ×{ao.jumlah}
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-bold text-[#A65C37]">
                    Total: {formatRupiah(total)}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition active:scale-95 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#A65C37] hover:bg-[#d36e3b]'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    'Konfirmasi Pesanan'
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  )
}