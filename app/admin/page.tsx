"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Section =
  | "Dashboard"
  | "Pemilik"
  | "Motor"
  | "Jadwal"
  | "Perawatan"
  | "Pembayaran"
  | "Produk & Alat"
  | "Riwayat";

type MotorRecord = {
  id: string;
  owner_id: string;
  name: string;
  brand: string;
  model: string;
  plate_number: string;
  year: string;
  color: string;
  notes: string;
  is_active: boolean;
  is_public: boolean;
};

type ScheduleRecord = {
  id: string;
  motor_id: string;
  frequency: string;
  day_of_week: string;
  time: string;
  service_type: string;
  is_active: boolean;
  next_date: string;
  created_at: string;
};

type MaintenanceRecord = {
  id: string;
  motor_id: string;
  schedule_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
};

type ProductRecord = {
  id: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  unit: string;
  low_stock_threshold: number;
  track_stock: boolean;
  notes: string;
  is_active: boolean;
};

type PaymentRecord = {
  id: string;
  owner_id: string;
  period: string;
  amount: number;
  status: string;
  paid_at: string | null;
  payment_method: string;
  admin_notes: string;
};

type HistoryRecord = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  type: string;
};

type OwnerRecord = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  is_public: boolean;
  motors: number;
};

const menu: { name: Section; icon: string }[] = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Pemilik", icon: "◉" },
  { name: "Motor", icon: "◌" },
  { name: "Jadwal", icon: "◷" },
  { name: "Perawatan", icon: "✦" },
  { name: "Pembayaran", icon: "◇" },
  { name: "Produk & Alat", icon: "▣" },
  { name: "Riwayat", icon: "↻" },
];

const ownerDemoData = [
  {
    name: "Pemilik 01",
    phone: "08xx-xxxx-1201",
    motors: 2,
    status: "Aktif",
  },
  {
    name: "Pemilik 02",
    phone: "08xx-xxxx-2388",
    motors: 1,
    status: "Aktif",
  },
  {
    name: "Pemilik 03",
    phone: "08xx-xxxx-4512",
    motors: 1,
    status: "Aktif",
  },
];

const motors = [
  {
    name: "Honda PCX 160",
    plate: "F 2847 XX",
    owner: "Pemilik 01",
    last: "14 Sep 2026",
    next: "21 Sep 2026",
    status: "Ready",
  },
  {
    name: "Honda Beat",
    plate: "F 3921 XX",
    owner: "Pemilik 01",
    last: "07 Sep 2026",
    next: "15 Sep 2026",
    status: "Scheduled",
  },
  {
    name: "Yamaha NMAX",
    plate: "F 5192 XX",
    owner: "Pemilik 02",
    last: "10 Sep 2026",
    next: "17 Sep 2026",
    status: "Ready",
  },
];

const schedules = [
  {
    date: "14 Sep",
    time: "09:00",
    motor: "Honda PCX 160",
    service: "Full Wash",
    frequency: "Weekly",
    status: "Selesai",
  },
  {
    date: "15 Sep",
    time: "15:30",
    motor: "Honda Beat",
    service: "Wash + Maintenance",
    frequency: "Weekly",
    status: "Menunggu",
  },
  {
    date: "17 Sep",
    time: "10:00",
    motor: "Yamaha NMAX",
    service: "Full Wash",
    frequency: "2 Weeks",
    status: "Terjadwal",
  },
];

const maintenance = [
  {
    date: "14 Sep 2026",
    motor: "Honda PCX 160",
    service: "Full Wash",
    products: "KIT Shampoo · KIT Wax · Semir Ban",
    duration: "45 min",
    status: "Completed",
  },
  {
    date: "07 Sep 2026",
    motor: "Honda Beat",
    service: "Wash + Maintenance",
    products: "KIT Shampoo · Microfiber",
    duration: "35 min",
    status: "Completed",
  },
  {
    date: "31 Aug 2026",
    motor: "Honda PCX 160",
    service: "Full Wash",
    products: "KIT Shampoo · KIT Wax",
    duration: "40 min",
    status: "Completed",
  },
];

const payments = [
  {
    date: "14 Sep 2026",
    owner: "Pemilik 01",
    period: "September 2026",
    motors: "PCX 160 + Beat",
    amount: "Rp 300.000",
    method: "Transfer",
    status: "Paid",
  },
  {
    date: "10 Sep 2026",
    owner: "Pemilik 02",
    period: "September 2026",
    motors: "NMAX",
    amount: "Rp 150.000",
    method: "Cash",
    status: "Paid",
  },
  {
    date: "-",
    owner: "Pemilik 03",
    period: "September 2026",
    motors: "1 Motor",
    amount: "Rp 150.000",
    method: "-",
    status: "Pending",
  },
];

const products = [
  {
    name: "KIT Shampoo",
    category: "Cleaning",
    stock: 8,
    unit: "botol",
    threshold: 3,
    status: "Aman",
  },
  {
    name: "KIT Wax",
    category: "Protection",
    stock: 3,
    unit: "botol",
    threshold: 3,
    status: "Menipis",
  },
  {
    name: "Semir Ban",
    category: "Detailing",
    stock: 6,
    unit: "botol",
    threshold: 2,
    status: "Aman",
  },
  {
    name: "Microfiber",
    category: "Tools",
    stock: 2,
    unit: "pcs",
    threshold: 3,
    status: "Menipis",
  },
];



export default function AdminPage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [active, setActive] = useState<Section>("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [supabaseStatus, setSupabaseStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  const [supabaseError, setSupabaseError] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [ownerRows, setOwnerRows] = useState<OwnerRecord[]>([]);
  const [motorRows, setMotorRows] = useState<MotorRecord[]>([]);
  const [motorLoading, setMotorLoading] = useState(true);
  const [motorModalOpen, setMotorModalOpen] = useState(false);
  const [editingMotorId, setEditingMotorId] = useState<string | null>(null);
  const [motorSaving, setMotorSaving] = useState(false);
  const [motorFormError, setMotorFormError] = useState("");
  const [motorForm, setMotorForm] = useState({
    owner_id: "",
    name: "",
    brand: "",
    model: "",
    plate_number: "",
    year: "",
    color: "",
    notes: "",
  });
  const [scheduleRows, setScheduleRows] = useState<ScheduleRecord[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleFormError, setScheduleFormError] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    motor_id: "",
    frequency: "weekly",
    day_of_week: "1",
    time: "09:00",
    service_type: "Full Wash",
    next_date: "",
  });

  const [maintenanceRows, setMaintenanceRows] = useState<MaintenanceRecord[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceFormError, setMaintenanceFormError] = useState("");
  const [maintenanceForm, setMaintenanceForm] = useState({
    motor_id: "",
    schedule_id: "",
    date: new Date().toISOString().slice(0, 10),
    start_time: "09:00",
    end_time: "09:45",
    status: "Selesai",
    notes: "",
  });

  const [productRows, setProductRows] = useState<ProductRecord[]>([]);
  const [productLoading, setProductLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productFormError, setProductFormError] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<ProductRecord | null>(null);
  const [stockAmount, setStockAmount] = useState("");
  const [stockAction, setStockAction] = useState<"add" | "subtract">("add");
  const [stockSaving, setStockSaving] = useState(false);
  const [stockError, setStockError] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "Cleaning",
    stock: "0",
    unit: "botol",
    low_stock_threshold: "2",
    track_stock: true,
    notes: "",
  });

  const [paymentRows, setPaymentRows] = useState<PaymentRecord[]>([]);
  const [historyRows, setHistoryRows] = useState<HistoryRecord[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    owner_id: "",
    period: new Date().toISOString().slice(0, 7),
    amount: "",
    status: "Paid",
    paid_at: new Date().toISOString().slice(0, 10),
    payment_method: "Transfer",
    admin_notes: "",
  });

  const [usageDraft, setUsageDraft] = useState<Record<string, string>>({});

  const [ownerLoading, setOwnerLoading] = useState(true);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<OwnerRecord | null>(null);
  const [ownerSaving, setOwnerSaving] = useState(false);
  const [ownerFormError, setOwnerFormError] = useState("");
  const [ownerForm, setOwnerForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const selectMenu = (section: Section) => {
    setActive(section);
    setMobileOpen(false);
  };

  const getSupabaseError = (error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  }) =>
    [
      error.message ? `Message: ${error.message}` : "",
      error.code ? `Code: ${error.code}` : "",
      error.details ? `Details: ${error.details}` : "",
      error.hint ? `Hint: ${error.hint}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  async function loadOwners() {
    setOwnerLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("owners")
        .select("id, name, phone, address, notes, is_public")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const rows = data ?? [];

      setOwnerRows(
        rows.map((owner) => ({
          id: owner.id,
          name: owner.name || "Tanpa nama",
          phone: owner.phone || "-",
          address: owner.address || "-",
          notes: owner.notes || "",
          is_public: owner.is_public ?? false,
          motors: 0,
        }))
      );
    } catch (error) {
      const details =
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as {
              message?: string;
              code?: string;
              details?: string;
              hint?: string;
            })
          : error instanceof Error
            ? error.message
            : "Gagal mengambil data pemilik.";

      setSupabaseError(details || "Gagal mengambil data pemilik.");
      setSupabaseStatus("error");
    } finally {
      setOwnerLoading(false);
    }
  }

  async function loadProducts() {
    setProductLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, category, stock, unit, low_stock_threshold, track_stock, notes, is_active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProductRows(
        (data ?? []).map((item) => ({
          id: item.id,
          name: item.name || "Tanpa nama",
          brand: item.brand || "-",
          category: item.category || "Other",
          stock: Number(item.stock ?? 0),
          unit: item.unit || "pcs",
          low_stock_threshold: Number(item.low_stock_threshold ?? 0),
          track_stock: item.track_stock ?? true,
          notes: item.notes || "",
          is_active: item.is_active ?? true,
        }))
      );
    } catch (error) {
      const details =
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as { message?: string; code?: string; details?: string; hint?: string })
          : error instanceof Error
            ? error.message
            : "Gagal mengambil data produk.";
      setSupabaseError(details || "Gagal mengambil data produk.");
      setSupabaseStatus("error");
    } finally {
      setProductLoading(false);
    }
  }

  function getProductStatus(product: ProductRecord) {
    if (!product.track_stock) return "Tidak dilacak";
    if (product.stock <= 0) return "Habis";
    if (product.stock <= product.low_stock_threshold) return "Menipis";
    return "Aman";
  }

  function openProductModal(product?: ProductRecord) {
    if (product) {
      setEditingProductId(product.id);
      setProductForm({
        name: product.name,
        brand: product.brand === "-" ? "" : product.brand,
        category: product.category,
        stock: String(product.stock),
        unit: product.unit,
        low_stock_threshold: String(product.low_stock_threshold),
        track_stock: product.track_stock,
        notes: product.notes,
      });
    } else {
      setEditingProductId(null);
      setProductForm({
        name: "",
        brand: "",
        category: "Cleaning",
        stock: "0",
        unit: "botol",
        low_stock_threshold: "2",
        track_stock: true,
        notes: "",
      });
    }
    setProductFormError("");
    setProductModalOpen(true);
  }

  function closeProductModal() {
    if (productSaving) return;
    setProductModalOpen(false);
    setEditingProductId(null);
    setProductFormError("");
  }

  function openStockModal(product: ProductRecord, action: "add" | "subtract") {
    setStockModalProduct(product);
    setStockAction(action);
    setStockAmount("");
    setStockError("");
  }

  function closeStockModal() {
    if (stockSaving) return;
    setStockModalProduct(null);
    setStockAmount("");
    setStockError("");
  }

  async function adjustStock() {
    if (!stockModalProduct) return;

    const amount = Number(stockAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setStockError("Jumlah stok harus berupa angka bulat lebih dari 0.");
      return;
    }

    const nextStock = stockAction === "add"
      ? stockModalProduct.stock + amount
      : stockModalProduct.stock - amount;

    if (nextStock < 0) {
      setStockError("Stok tidak boleh menjadi negatif.");
      return;
    }

    setStockSaving(true);
    setStockError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.replace("/admin/login");
        return;
      }

      const { error } = await supabase
        .from("products")
        .update({ stock: nextStock })
        .eq("id", stockModalProduct.id);

      if (error) throw error;

      closeStockModal();
      await loadProducts();
    } catch (error) {
      setStockError(
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as { message?: string; code?: string; details?: string; hint?: string })
          : error instanceof Error
            ? error.message
            : "Gagal mengubah stok."
      );
    } finally {
      setStockSaving(false);
    }
  }

  async function archiveProduct(product: ProductRecord) {
    if (!window.confirm(`Arsipkan ${product.name}? Produk tidak akan dihapus dari database.`)) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.replace("/admin/login");
        return;
      }

      const { error } = await supabase
        .from("products")
        .update({ is_active: false })
        .eq("id", product.id);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      setSupabaseError(
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as { message?: string; code?: string; details?: string; hint?: string })
          : error instanceof Error
            ? error.message
            : "Gagal mengarsipkan produk."
      );
      setSupabaseStatus("error");
    }
  }

  async function deleteProduct(product: ProductRecord) {
    if (!window.confirm(`Hapus permanen ${product.name}? Data penggunaan produk yang sudah tercatat juga akan dihapus.`)) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { error: usageError } = await supabase.from("product_usage").delete().eq("product_id", product.id);
      if (usageError) throw usageError;
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      await Promise.all([loadProducts(), loadHistory()]);
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : "Gagal menghapus produk.");
      setSupabaseStatus("error");
    }
  }

  async function saveProduct() {
    if (!productForm.name.trim()) {
      setProductFormError("Nama produk/alat wajib diisi.");
      return;
    }

    const stock = Number(productForm.stock);
    const threshold = Number(productForm.low_stock_threshold);

    if (!Number.isInteger(stock) || stock < 0) {
      setProductFormError("Stok harus berupa angka bulat 0 atau lebih.");
      return;
    }

    if (!Number.isInteger(threshold) || threshold < 0) {
      setProductFormError("Batas stok minimum harus berupa angka 0 atau lebih.");
      return;
    }

    if (!productForm.unit.trim()) {
      setProductFormError("Satuan wajib diisi.");
      return;
    }

    setProductSaving(true);
    setProductFormError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace("/admin/login");
        return;
      }

      const payload = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim() || null,
        category: productForm.category.trim() || "Other",
        stock,
        unit: productForm.unit.trim(),
        low_stock_threshold: threshold,
        track_stock: productForm.track_stock,
        notes: productForm.notes.trim() || null,
        is_active: true,
      };

      const query = editingProductId
        ? supabase.from("products").update(payload).eq("id", editingProductId)
        : supabase.from("products").insert(payload);

      const { error } = await query;

      if (error) {
        setProductFormError(getSupabaseError(error));
        return;
      }

      setProductModalOpen(false);
      setEditingProductId(null);
      await loadProducts();
    } catch (error) {
      setProductFormError(error instanceof Error ? error.message : "Gagal menyimpan produk.");
    } finally {
      setProductSaving(false);
    }
  }

  async function loadPayments() {
    setPaymentLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("payments")
        .select("id, owner_id, period, amount, status, paid_at, payment_method, admin_notes")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPaymentRows((data ?? []).map((item) => ({
        id: item.id,
        owner_id: item.owner_id,
        period: item.period || "-",
        amount: Number(item.amount ?? 0),
        status: item.status || "Pending",
        paid_at: item.paid_at || null,
        payment_method: item.payment_method || "-",
        admin_notes: item.admin_notes || "",
      })));
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : getSupabaseError(error as {message?:string;code?:string;details?:string;hint?:string}));
      setSupabaseStatus("error");
    } finally {
      setPaymentLoading(false);
    }
  }

  function openPaymentModal(payment?: PaymentRecord) {
    setEditingPaymentId(payment?.id ?? null);
    setPaymentForm({
      owner_id: payment?.owner_id ?? ownerRows[0]?.id ?? "",
      period: payment?.period ?? new Date().toISOString().slice(0, 7),
      amount: payment ? String(payment.amount) : "",
      status: payment?.status ?? "Paid",
      paid_at: payment?.paid_at ?? new Date().toISOString().slice(0, 10),
      payment_method: payment?.payment_method ?? "Transfer",
      admin_notes: payment?.admin_notes ?? "",
    });
    setPaymentFormError("");
    setPaymentModalOpen(true);
  }

  function closePaymentModal() {
    if (paymentSaving) return;
    setPaymentModalOpen(false);
    setEditingPaymentId(null);
    setPaymentFormError("");
  }

  async function savePayment() {
    if (!paymentForm.owner_id) {
      setPaymentFormError("Pilih pemilik terlebih dahulu.");
      return;
    }
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentFormError("Nominal pembayaran harus lebih dari 0.");
      return;
    }
    if (!paymentForm.period) {
      setPaymentFormError("Periode wajib diisi.");
      return;
    }
    setPaymentSaving(true);
    setPaymentFormError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const paymentPayload = {
        owner_id: paymentForm.owner_id,
        period: paymentForm.period,
        amount,
        status: paymentForm.status,
        paid_at: paymentForm.status === "Paid" ? (paymentForm.paid_at || null) : null,
        payment_method: paymentForm.payment_method,
        admin_notes: paymentForm.admin_notes.trim() || null,
      };
      const { error } = editingPaymentId
        ? await supabase.from("payments").update(paymentPayload).eq("id", editingPaymentId)
        : await supabase.from("payments").insert(paymentPayload);
      if (error) { setPaymentFormError(getSupabaseError(error)); return; }
      closePaymentModal();
      await Promise.all([loadPayments(), loadHistory()]);
    } catch (error) {
      setPaymentFormError(error instanceof Error ? error.message : "Gagal menyimpan pembayaran.");
    } finally {
      setPaymentSaving(false);
    }
  }

  async function deletePayment(payment: PaymentRecord) {
    if (!window.confirm(`Hapus pembayaran ${formatRupiah(payment.amount)} untuk ${ownerRows.find((x) => x.id === payment.owner_id)?.name || "pemilik"}?`)) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { error } = await supabase.from("payments").delete().eq("id", payment.id);
      if (error) throw error;
      await Promise.all([loadPayments(), loadHistory()]);
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : "Gagal menghapus pembayaran.");
      setSupabaseStatus("error");
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace("/admin/login");
  }

  async function loadMotors() {
    setMotorLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("motors")
        .select(
          "id, owner_id, name, brand, model, plate_number, year, color, notes, is_active, is_public"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMotorRows((data ?? []).map((motor) => ({
        id: motor.id,
        owner_id: motor.owner_id,
        name: motor.name || "Tanpa nama",
        brand: motor.brand || "-",
        model: motor.model || "-",
        plate_number: motor.plate_number || "-",
        year: motor.year ? String(motor.year) : "-",
        color: motor.color || "-",
        notes: motor.notes || "",
        is_active: motor.is_active ?? true,
        is_public: motor.is_public ?? false,
      })));
    } catch (error) {
      const details =
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as { message?: string; code?: string; details?: string; hint?: string })
          : error instanceof Error
            ? error.message
            : "Gagal mengambil data motor.";
      setSupabaseError(details || "Gagal mengambil data motor.");
      setSupabaseStatus("error");
    } finally {
      setMotorLoading(false);
    }
  }

  function openOwnerDetail(owner: OwnerRecord) {
    setSelectedOwner(owner);
  }

  function closeOwnerDetail() {
    setSelectedOwner(null);
  }

  function openMotorModal(motor?: MotorRecord) {
    setEditingMotorId(motor?.id ?? null);
    setMotorForm({
      owner_id: motor?.owner_id ?? ownerRows[0]?.id ?? "",
      name: motor?.name ?? "",
      brand: motor?.brand === "-" ? "" : motor?.brand ?? "",
      model: motor?.model === "-" ? "" : motor?.model ?? "",
      plate_number: motor?.plate_number === "-" ? "" : motor?.plate_number ?? "",
      year: motor?.year === "-" ? "" : motor?.year ?? "",
      color: motor?.color === "-" ? "" : motor?.color ?? "",
      notes: motor?.notes ?? "",
    });
    setMotorFormError("");
    setMotorModalOpen(true);
  }

  function closeMotorModal() {
    if (motorSaving) return;
    setMotorModalOpen(false);
    setEditingMotorId(null);
    setMotorFormError("");
  }

  async function saveMotor() {
    if (!motorForm.owner_id) {
      setMotorFormError("Pilih pemilik motor terlebih dahulu.");
      return;
    }
    if (!motorForm.name.trim()) {
      setMotorFormError("Nama motor wajib diisi.");
      return;
    }

    const yearText = motorForm.year.trim();
    const parsedYear = yearText ? Number(yearText) : null;

    if (
      yearText &&
      (parsedYear === null ||
        !Number.isInteger(parsedYear) ||
        parsedYear < 1900 ||
        parsedYear > 2100)
    ) {
      setMotorFormError("Tahun motor harus berupa tahun yang valid, contoh 2024.");
      return;
    }

    setMotorSaving(true);
    setMotorFormError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace("/admin/login");
        return;
      }

      const { count, error: countError } = await supabase
        .from("motors")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", motorForm.owner_id);

      if (countError) {
        setMotorFormError(getSupabaseError(countError));
        return;
      }

      const isChangingOwner = Boolean(editingMotorId && motorRows.find((row) => row.id === editingMotorId)?.owner_id !== motorForm.owner_id);
      if (!editingMotorId && (count ?? 0) >= 5) {
        setMotorFormError("Pemilik ini sudah mencapai batas 5 motor.");
        return;
      }
      if (editingMotorId && isChangingOwner && (count ?? 0) >= 5) {
        setMotorFormError("Pemilik tujuan sudah mencapai batas 5 motor.");
        return;
      }

      const payload = {
        owner_id: motorForm.owner_id,
        name: motorForm.name.trim(),
        brand: motorForm.brand.trim() || null,
        model: motorForm.model.trim() || null,
        plate_number: motorForm.plate_number.trim() || null,
        year: parsedYear,
        color: motorForm.color.trim() || null,
        notes: motorForm.notes.trim() || null,
        is_active: true,
        is_public: true,
      };

      const { error } = editingMotorId
        ? await supabase.from("motors").update(payload).eq("id", editingMotorId)
        : await supabase.from("motors").insert(payload);

      if (error) {
        setMotorFormError(getSupabaseError(error));
        return;
      }

      setMotorModalOpen(false);
      setEditingMotorId(null);
      await Promise.all([loadMotors(), loadOwners(), loadHistory()]);
    } catch (error) {
      setMotorFormError(error instanceof Error ? error.message : "Gagal menyimpan motor.");
    } finally {
      setMotorSaving(false);
    }
  }

  async function loadMaintenance() {
    setMaintenanceLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("id, motor_id, schedule_id, date, start_time, end_time, status, notes")
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) throw error;

      setMaintenanceRows(
        (data ?? []).map((item) => ({
          id: item.id,
          motor_id: item.motor_id,
          schedule_id: item.schedule_id || null,
          date: item.date || "",
          start_time: item.start_time ? String(item.start_time).slice(0, 5) : "-",
          end_time: item.end_time ? String(item.end_time).slice(0, 5) : "-",
          status: item.status || "Selesai",
          notes: item.notes || "",
        }))
      );
    } catch (error) {
      const details =
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as { message?: string; code?: string; details?: string; hint?: string })
          : error instanceof Error
            ? error.message
            : "Gagal mengambil data perawatan.";
      setSupabaseError(details || "Gagal mengambil data perawatan.");
      setSupabaseStatus("error");
    } finally {
      setMaintenanceLoading(false);
    }
  }

  function addDays(dateString: string, days: number) {
    const date = new Date(`${dateString}T12:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function addMonths(dateString: string, months: number) {
    const date = new Date(`${dateString}T12:00:00`);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 10);
  }

  function openMaintenanceModal(maintenance?: MaintenanceRecord) {
    setEditingMaintenanceId(maintenance?.id ?? null);
    setMaintenanceForm({
      motor_id: maintenance?.motor_id ?? motorRows[0]?.id ?? "",
      schedule_id: maintenance?.schedule_id ?? "",
      date: maintenance?.date ?? new Date().toISOString().slice(0, 10),
      start_time: maintenance?.start_time === "-" ? "09:00" : maintenance?.start_time ?? "09:00",
      end_time: maintenance?.end_time === "-" ? "09:45" : maintenance?.end_time ?? "09:45",
      status: maintenance?.status ?? "Selesai",
      notes: maintenance?.notes ?? "",
    });
    setMaintenanceFormError("");
    setUsageDraft({});
    setMaintenanceModalOpen(true);
  }

  function closeMaintenanceModal() {
    if (maintenanceSaving) return;
    setMaintenanceModalOpen(false);
    setEditingMaintenanceId(null);
    setMaintenanceFormError("");
  }

  async function saveMaintenance() {
    if (!maintenanceForm.motor_id) {
      setMaintenanceFormError("Pilih motor terlebih dahulu.");
      return;
    }
    if (!maintenanceForm.date) {
      setMaintenanceFormError("Tanggal perawatan wajib diisi.");
      return;
    }
    if (!maintenanceForm.start_time || !maintenanceForm.end_time) {
      setMaintenanceFormError("Jam mulai dan selesai wajib diisi.");
      return;
    }

    setMaintenanceSaving(true);
    setMaintenanceFormError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace("/admin/login");
        return;
      }

      const maintenancePayload = {
        motor_id: maintenanceForm.motor_id,
        schedule_id: maintenanceForm.schedule_id || null,
        date: maintenanceForm.date,
        start_time: maintenanceForm.start_time,
        end_time: maintenanceForm.end_time,
        status: maintenanceForm.status,
        notes: maintenanceForm.notes.trim() || null,
      };

      const maintenanceQuery = editingMaintenanceId
        ? await supabase.from("maintenance_records").update(maintenancePayload).eq("id", editingMaintenanceId).select("id").single()
        : await supabase.from("maintenance_records").insert(maintenancePayload).select("id").single();

      const maintenanceData = maintenanceQuery.data;
      const error = maintenanceQuery.error;

      if (error) {
        setMaintenanceFormError(getSupabaseError(error));
        return;
      }

      const usageItems = Object.entries(usageDraft)
        .map(([product_id, quantity]) => ({ product_id, quantity: Number(quantity) }))
        .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);

      if (!editingMaintenanceId && maintenanceData?.id && usageItems.length > 0) {
        for (const item of usageItems) {
          const product = productRows.find((row) => row.id === item.product_id);
          if (!product) continue;
          if (product.track_stock && item.quantity > product.stock) {
            setMaintenanceFormError(`${product.name}: stok tidak cukup.`);
            await supabase.from("maintenance_records").delete().eq("id", maintenanceData.id);
            return;
          }
        }

        const { error: usageError } = await supabase.from("product_usage").insert(
          usageItems.map((item) => ({
            maintenance_id: maintenanceData.id,
            product_id: item.product_id,
            quantity_used: item.quantity,
          }))
        );
        if (usageError) {
          setMaintenanceFormError(getSupabaseError(usageError));
          await supabase.from("maintenance_records").delete().eq("id", maintenanceData.id);
          return;
        }

        for (const item of usageItems) {
          const product = productRows.find((row) => row.id === item.product_id);
          if (product?.track_stock) {
            await supabase.from("products").update({ stock: product.stock - item.quantity }).eq("id", product.id);
          }
        }
      }

      // Jika perawatan berasal dari jadwal, hitung jadwal berikutnya.
      if (maintenanceForm.schedule_id) {
        const schedule = scheduleRows.find((item) => item.id === maintenanceForm.schedule_id);

        if (schedule) {
          const nextDate =
            schedule.frequency === "weekly"
              ? addDays(maintenanceForm.date, 7)
              : schedule.frequency === "every_2_weeks"
                ? addDays(maintenanceForm.date, 14)
                : schedule.frequency === "monthly"
                  ? addMonths(maintenanceForm.date, 1)
                  : schedule.frequency === "one_time"
                    ? maintenanceForm.date
                    : addDays(maintenanceForm.date, 7);

          await supabase
            .from("schedules")
            .update({
              next_date: nextDate,
              is_active: schedule.frequency === "one_time" ? false : true,
            })
            .eq("id", schedule.id);
        }
      }

      setMaintenanceModalOpen(false);
      setEditingMaintenanceId(null);
      await Promise.all([loadMaintenance(), loadProducts(), loadSchedules(), loadHistory()]);
      await loadProducts();
      await loadSchedules();
    } catch (error) {
      setMaintenanceFormError(error instanceof Error ? error.message : "Gagal menyimpan perawatan.");
    } finally {
      setMaintenanceSaving(false);
    }
  }

  async function deleteMaintenance(item: MaintenanceRecord) {
    if (!window.confirm(`Hapus riwayat perawatan tanggal ${item.date}?`)) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { error: usageError } = await supabase.from("product_usage").delete().eq("maintenance_id", item.id);
      if (usageError) throw usageError;
      const { error } = await supabase.from("maintenance_records").delete().eq("id", item.id);
      if (error) throw error;
      await Promise.all([loadMaintenance(), loadHistory()]);
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : "Gagal menghapus riwayat perawatan.");
      setSupabaseStatus("error");
    }
  }

  async function loadSchedules() {
    setScheduleLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("schedules")
        .select("id, motor_id, frequency, day_of_week, time, service_type, is_active, next_date, created_at")
        .order("next_date", { ascending: true });

      if (error) throw error;

      setScheduleRows(
        (data ?? []).map((item) => ({
          id: item.id,
          motor_id: item.motor_id,
          frequency: item.frequency || "-",
          day_of_week: item.day_of_week == null ? "-" : String(item.day_of_week),
          time: item.time ? String(item.time).slice(0, 5) : "-",
          service_type: item.service_type || "-",
          is_active: item.is_active ?? true,
          next_date: item.next_date || "",
          created_at: item.created_at || "",
        }))
      );
    } catch (error) {
      const details =
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as { message?: string; code?: string; details?: string; hint?: string })
          : error instanceof Error
            ? error.message
            : "Gagal mengambil data jadwal.";
      setSupabaseError(details || "Gagal mengambil data jadwal.");
      setSupabaseStatus("error");
    } finally {
      setScheduleLoading(false);
    }
  }

  function openScheduleModal(schedule?: ScheduleRecord) {
    setEditingScheduleId(schedule?.id ?? null);
    setScheduleForm({
      motor_id: schedule?.motor_id ?? motorRows[0]?.id ?? "",
      frequency: schedule?.frequency ?? "weekly",
      day_of_week: schedule?.day_of_week === "-" ? "1" : schedule?.day_of_week ?? "1",
      time: schedule?.time === "-" ? "09:00" : schedule?.time ?? "09:00",
      service_type: schedule?.service_type === "-" ? "Full Wash" : schedule?.service_type ?? "Full Wash",
      next_date: schedule?.next_date ?? new Date().toISOString().slice(0, 10),
    });
    setScheduleFormError("");
    setScheduleModalOpen(true);
  }

  function closeScheduleModal() {
    if (scheduleSaving) return;
    setScheduleModalOpen(false);
    setEditingScheduleId(null);
    setScheduleFormError("");
  }

  async function saveSchedule() {
    if (!scheduleForm.motor_id) {
      setScheduleFormError("Pilih motor terlebih dahulu.");
      return;
    }
    if (!scheduleForm.next_date) {
      setScheduleFormError("Tanggal jadwal wajib diisi.");
      return;
    }

    setScheduleSaving(true);
    setScheduleFormError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.replace("/admin/login");
        return;
      }

      const payload = {
        motor_id: scheduleForm.motor_id,
        frequency: scheduleForm.frequency,
        day_of_week: Number(scheduleForm.day_of_week),
        time: scheduleForm.time,
        service_type: scheduleForm.service_type.trim() || "Full Wash",
        is_active: true,
        next_date: scheduleForm.next_date,
      };

      const { error } = editingScheduleId
        ? await supabase.from("schedules").update(payload).eq("id", editingScheduleId)
        : await supabase.from("schedules").insert(payload);

      if (error) {
        setScheduleFormError(getSupabaseError(error));
        return;
      }

      setScheduleModalOpen(false);
      setEditingScheduleId(null);
      await Promise.all([loadSchedules(), loadHistory()]);
    } catch (error) {
      setScheduleFormError(error instanceof Error ? error.message : "Gagal menyimpan jadwal.");
    } finally {
      setScheduleSaving(false);
    }
  }

  async function deleteSchedule(schedule: ScheduleRecord) {
    if (!window.confirm(`Hapus jadwal ${schedule.service_type}?`)) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { error } = await supabase.from("schedules").delete().eq("id", schedule.id);
      if (error) throw error;
      await Promise.all([loadSchedules(), loadHistory()]);
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : "Gagal menghapus jadwal.");
      setSupabaseStatus("error");
    }
  }

  async function loadHistory() {
    try {
      const supabase = createClient();

      const [maintenanceResult, paymentResult, scheduleResult, usageResult] =
        await Promise.all([
          supabase
            .from("maintenance_records")
            .select("id, motor_id, date, start_time, end_time, status, notes")
            .order("date", { ascending: false })
            .order("start_time", { ascending: false })
            .limit(50),
          supabase
            .from("payments")
            .select("id, owner_id, period, amount, status, paid_at, payment_method")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("schedules")
            .select("id, motor_id, frequency, service_type, next_date, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("product_usage")
            .select("id, maintenance_id, product_id, quantity_used, created_at")
            .order("created_at", { ascending: false })
            .limit(100),
        ]);

      const errors = [
        maintenanceResult.error,
        paymentResult.error,
        scheduleResult.error,
        usageResult.error,
      ].filter(Boolean);

      if (errors.length > 0) throw errors[0];

      const maintenanceHistory: HistoryRecord[] = (maintenanceResult.data ?? []).map(
        (item) => {
          const motor = motorRows.find((row) => row.id === item.motor_id);
          return {
            id: `maintenance-${item.id}`,
            timestamp: `${item.date}T${String(item.start_time || "00:00").slice(0, 5)}`,
            title: "Perawatan tercatat",
            detail: `${motor?.name || "Motor"} · ${item.notes?.trim() || "Maintenance"}`,
            type: "Maintenance",
          };
        },
      );

      const paymentHistory: HistoryRecord[] = (paymentResult.data ?? []).map(
        (item) => {
          const owner = ownerRows.find((row) => row.id === item.owner_id);
          const timestamp = item.paid_at
            ? `${item.paid_at}T12:00:00`
            : `${item.period}-01T12:00:00`;
          return {
            id: `payment-${item.id}`,
            timestamp,
            title:
              String(item.status || "").toLowerCase() === "paid" ||
              String(item.status || "").toLowerCase() === "lunas"
                ? "Pembayaran diterima"
                : "Pembayaran tercatat",
            detail: `${owner?.name || "Pemilik"} · ${formatRupiah(Number(item.amount || 0))} · ${item.payment_method || "-"}`,
            type: "Payment",
          };
        },
      );

      const scheduleHistory: HistoryRecord[] = (scheduleResult.data ?? []).map(
        (item) => {
          const motor = motorRows.find((row) => row.id === item.motor_id);
          return {
            id: `schedule-${item.id}`,
            timestamp: item.created_at || `${item.next_date}T00:00:00`,
            title: "Jadwal dibuat",
            detail: `${motor?.name || "Motor"} · ${item.service_type || "Motor Care"} · ${String(item.frequency || "").replaceAll("_", " ")}`,
            type: "Schedule",
          };
        },
      );

      const usageHistory: HistoryRecord[] = (usageResult.data ?? []).map((item) => {
        const product = productRows.find((row) => row.id === item.product_id);
        const maintenance = (maintenanceResult.data ?? []).find(
          (row) => row.id === item.maintenance_id,
        );
        const motor = maintenance
          ? motorRows.find((row) => row.id === maintenance.motor_id)
          : null;
        return {
          id: `usage-${item.id}`,
          timestamp: item.created_at || `${maintenance?.date || dashboardToday}T00:00:00`,
          title: "Produk digunakan",
          detail: `${product?.name || "Produk"} · ${item.quantity_used} ${product?.unit || "unit"}${motor ? ` · ${motor.name}` : ""}`,
          type: "Inventory",
        };
      });

      setHistoryRows(
        [...maintenanceHistory, ...paymentHistory, ...scheduleHistory, ...usageHistory]
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, 100),
      );
    } catch (error) {
      setSupabaseError(
        error && typeof error === "object" && "message" in error
          ? getSupabaseError(error as { message?: string; code?: string; details?: string; hint?: string })
          : error instanceof Error
            ? error.message
            : "Gagal mengambil riwayat aktivitas.",
      );
      setSupabaseStatus("error");
    }
  }

  async function testSupabase() {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("owners")
        .select("id")
        .limit(1);

      if (error) {
        setSupabaseStatus("error");
        setSupabaseError(getSupabaseError(error));
        return;
      }

      setSupabaseStatus("connected");
      setSupabaseError("");
      await loadOwners();
      await loadMotors();
      await loadSchedules();
      await loadMaintenance();
      await loadProducts();
      await loadPayments();
      await loadHistory();
    } catch (err) {
      setSupabaseStatus("error");

      if (err instanceof Error) {
        setSupabaseError(err.message);
      } else {
        setSupabaseError("Terjadi error saat menghubungkan Supabase.");
      }

      setOwnerLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function checkAdminSession() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            window.location.replace("/admin/login");
          }
          return;
        }

        if (!mounted) return;

        setAuthChecking(false);
        await testSupabase();
      } catch {
        if (mounted) {
          window.location.replace("/admin/login");
        }
      }
    }

    checkAdminSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (authChecking) return;

    const supabase = createClient();
    const channel = supabase
      .channel("motorcare-admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "owners" },
        () => {
          void loadOwners();
          void loadHistory();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "motors" },
        () => {
          void loadMotors();
          void loadOwners();
          void loadHistory();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedules" },
        () => {
          void loadSchedules();
          void loadHistory();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "maintenance_records" },
        () => {
          void loadMaintenance();
          void loadSchedules();
          void loadProducts();
          void loadHistory();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          void loadPayments();
          void loadHistory();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          void loadProducts();
          void loadHistory();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_usage" },
        () => {
          void loadProducts();
          void loadMaintenance();
          void loadHistory();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("live");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("error");
        } else {
          setRealtimeStatus("connecting");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authChecking]);

  function openOwnerModal(owner?: OwnerRecord) {
    if (owner) {
      setEditingOwnerId(owner.id);
      setOwnerForm({
        name: owner.name,
        phone: owner.phone === "-" ? "" : owner.phone,
        address: owner.address === "-" ? "" : owner.address,
        notes: owner.notes,
      });
    } else {
      setEditingOwnerId(null);
      setOwnerForm({ name: "", phone: "", address: "", notes: "" });
    }
    setOwnerFormError("");
    setOwnerModalOpen(true);
  }

  function closeOwnerModal() {
    if (ownerSaving) return;
    setOwnerModalOpen(false);
    setEditingOwnerId(null);
    setOwnerFormError("");
  }

  async function saveOwner() {
    if (!ownerForm.name.trim()) {
      setOwnerFormError("Nama pemilik wajib diisi.");
      return;
    }

    setOwnerSaving(true);
    setOwnerFormError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.replace("/admin/login");
        return;
      }

      const payload = {
        name: ownerForm.name.trim(),
        phone: ownerForm.phone.trim() || null,
        address: ownerForm.address.trim() || null,
        notes: ownerForm.notes.trim() || null,
        is_public: true,
      };

      const result = editingOwnerId
        ? await supabase.from("owners").update(payload).eq("id", editingOwnerId)
        : await supabase.from("owners").insert(payload);

      if (result.error) {
        setOwnerFormError(getSupabaseError(result.error));
        return;
      }

      closeOwnerModal();
      await loadOwners();
    } catch (error) {
      setOwnerFormError(error instanceof Error ? error.message : "Gagal menyimpan pemilik.");
    } finally {
      setOwnerSaving(false);
    }
  }

  async function deleteOwner(owner: OwnerRecord) {
    const motorCount = motorRows.filter((motor) => motor.owner_id === owner.id).length;
    if (!window.confirm(`Hapus pemilik ${owner.name}?${motorCount ? ` ${motorCount} motor, jadwal, perawatan, dan data terkait juga akan dihapus.` : ""}`)) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }

      const ownerMotors = motorRows.filter((motor) => motor.owner_id === owner.id);
      for (const motor of ownerMotors) {
        const { data: maints, error: maintFetchError } = await supabase
          .from("maintenance_records").select("id").eq("motor_id", motor.id);
        if (maintFetchError) throw maintFetchError;
        const maintenanceIds = (maints ?? []).map((x) => x.id);
        if (maintenanceIds.length) {
          const { error } = await supabase.from("product_usage").delete().in("maintenance_id", maintenanceIds);
          if (error) throw error;
          const { error: e2 } = await supabase.from("maintenance_records").delete().eq("motor_id", motor.id);
          if (e2) throw e2;
        }
        const { error: e3 } = await supabase.from("schedules").delete().eq("motor_id", motor.id);
        if (e3) throw e3;
        const { error: e4 } = await supabase.from("motors").delete().eq("id", motor.id);
        if (e4) throw e4;
      }
      const { error: paymentError } = await supabase.from("payments").delete().eq("owner_id", owner.id);
      if (paymentError) throw paymentError;
      const { error: ownerError } = await supabase.from("owners").delete().eq("id", owner.id);
      if (ownerError) throw ownerError;

      setSelectedOwner(null);
      await Promise.all([loadOwners(), loadMotors(), loadSchedules(), loadMaintenance(), loadPayments(), loadHistory()]);
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : "Gagal menghapus pemilik.");
      setSupabaseStatus("error");
    }
  }

  async function deleteMotor(motor: MotorRecord) {
    if (!window.confirm(`Hapus motor ${motor.name}? Jadwal, riwayat perawatan, dan penggunaan produk terkait akan ikut dihapus.`)) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/admin/login"); return; }
      const { data: maints, error: maintFetchError } = await supabase.from("maintenance_records").select("id").eq("motor_id", motor.id);
      if (maintFetchError) throw maintFetchError;
      const maintenanceIds = (maints ?? []).map((x) => x.id);
      if (maintenanceIds.length) {
        const { error } = await supabase.from("product_usage").delete().in("maintenance_id", maintenanceIds);
        if (error) throw error;
        const { error: e2 } = await supabase.from("maintenance_records").delete().eq("motor_id", motor.id);
        if (e2) throw e2;
      }
      const { error: e3 } = await supabase.from("schedules").delete().eq("motor_id", motor.id);
      if (e3) throw e3;
      const { error: e4 } = await supabase.from("motors").delete().eq("id", motor.id);
      if (e4) throw e4;
      await Promise.all([loadMotors(), loadOwners(), loadSchedules(), loadMaintenance(), loadHistory()]);
    } catch (error) {
      setSupabaseError(error instanceof Error ? error.message : "Gagal menghapus motor.");
      setSupabaseStatus("error");
    }
  }


  const dashboardNow = new Date();
  const dashboardToday = `${dashboardNow.getFullYear()}-${String(
    dashboardNow.getMonth() + 1,
  ).padStart(2, "0")}-${String(dashboardNow.getDate()).padStart(2, "0")}`;
  const dashboardMonth = `${dashboardNow.getFullYear()}-${String(
    dashboardNow.getMonth() + 1,
  ).padStart(2, "0")}`;

  const dashboardTodaySchedules = scheduleRows
    .filter(
      (schedule) =>
        schedule.is_active && schedule.next_date === dashboardToday,
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const dashboardPaidThisMonth = paymentRows.filter((payment) => {
    const status = payment.status.toLowerCase();
    return (
      payment.period === dashboardMonth &&
      (status === "paid" ||
        status === "lunas" ||
        status === "selesai")
    );
  });

  const dashboardPaidTotal = dashboardPaidThisMonth.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const dashboardPendingPayments = paymentRows.filter((payment) => {
    const status = payment.status.toLowerCase();
    return (
      payment.period === dashboardMonth &&
      (status === "pending" ||
        status === "unpaid" ||
        status === "belum bayar" ||
        status === "menunggu")
    );
  }).length;

  const dashboardMaintenanceThisMonth = maintenanceRows.filter((item) => {
    return item.date.startsWith(dashboardMonth);
  }).length;

  const dashboardLowStock = productRows.filter(
    (product) =>
      product.is_active &&
      product.track_stock &&
      product.stock <= product.low_stock_threshold,
  );

  const dashboardTimeline = [
    ...maintenanceRows.map((item) => ({
      id: `maintenance-${item.id}`,
      timestamp: `${item.date}T${item.start_time || "00:00"}`,
      title: "Perawatan selesai",
      detail: `${
        motorRows.find((motor) => motor.id === item.motor_id)?.name ||
        motorRows.find((motor) => motor.id === item.motor_id)?.model ||
        "Motor"
      } · ${item.notes?.trim() || "Maintenance"}`,
      type: "Maintenance",
    })),
    ...paymentRows.map((item) => ({
      id: `payment-${item.id}`,
      timestamp: `${item.paid_at || `${item.period}-01`}T12:00`,
      title: "Pembayaran tercatat",
      detail: `${
        ownerRows.find((owner) => owner.id === item.owner_id)?.name ||
        "Pemilik"
      } · ${formatRupiah(Number(item.amount || 0))}`,
      type: "Payment",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    )
    .slice(0, 5);

  const dashboardDateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dashboardNow);

  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#07090c] text-white flex items-center justify-center px-5">
        <div className="text-center">
          <Image
            src="/motorcare-logo.png"
            alt="MotorCare"
            width={140}
            height={42}
            className="mx-auto w-[120px] object-contain opacity-80"
          />
          <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-white/30">
            Checking admin session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090c] text-white">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col border-r border-white/[0.07] bg-[#090c10] transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[76px] items-center border-b border-white/[0.07] px-6">
          <a href="/">
            <Image
              src="/motorcare-logo.png"
              alt="MotorCare"
              width={140}
              height={42}
              className="w-[105px] object-contain"
            />
          </a>
        </div>

        <div className="px-5 pt-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/25">
            Management
          </p>
        </div>

        <nav className="mt-3 flex-1 space-y-1 px-3">
          {menu.map((item) => {
            const selected = active === item.name;

            return (
              <button
                key={item.name}
                onClick={() => selectMenu(item.name)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[12px] font-medium transition ${
                  selected
                    ? "border border-blue-400/10 bg-blue-400/[0.07] text-white"
                    : "text-white/40 hover:bg-white/[0.035] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
                    selected
                      ? "bg-blue-400/[0.12] text-blue-300"
                      : "bg-white/[0.035] text-white/30"
                  }`}
                >
                  {item.icon}
                </span>

                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.07] p-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-medium text-white/35 transition hover:bg-white/[0.035] hover:text-white"
          >
            <span>←</span>
            Back to website
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[11px] font-medium text-red-300/45 transition hover:bg-red-400/[0.06] hover:text-red-300"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-400/[0.05] text-sm">
              ↪
            </span>
            Logout
          </button>

          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/[0.1] text-[11px] font-semibold text-blue-300">
              A
            </div>

            <div>
              <p className="text-[11px] font-semibold text-white/70">
                Administrator
              </p>
              <p className="mt-0.5 text-[9px] text-white/25">
                MotorCare Admin
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="lg:pl-[250px]">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#07090c]/85 px-5 backdrop-blur-2xl sm:px-7 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-white/60 lg:hidden"
            >
              ☰
            </button>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">
                MotorCare Admin
              </p>

              <h1 className="mt-1 text-lg font-semibold">{active}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-2 sm:flex ${
                supabaseStatus === "connected"
                  ? "border-emerald-400/10 bg-emerald-400/[0.04]"
                  : supabaseStatus === "error"
                    ? "border-red-400/10 bg-red-400/[0.04]"
                    : "border-amber-400/10 bg-amber-400/[0.04]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  supabaseStatus === "connected"
                    ? "bg-emerald-400"
                    : supabaseStatus === "error"
                      ? "bg-red-400"
                      : "bg-amber-400"
                }`}
              />

              <span
                className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
                  supabaseStatus === "connected"
                    ? "text-emerald-300/80"
                    : supabaseStatus === "error"
                      ? "text-red-300/80"
                      : "text-amber-300/80"
                }`}
              >
                {supabaseStatus === "connected"
                  ? "Supabase Online"
                  : supabaseStatus === "error"
                    ? "Supabase Error"
                    : "Checking"}
              </span>
            </div>

            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-sm text-white/50">
              🔔
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
          {/* SUPABASE STATUS */}
          {supabaseStatus === "error" && (
            <div className="mb-6 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/[0.08] text-red-300">
                  !
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-200">
                    Supabase belum terhubung
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-red-200/50">
                    Koneksi ke database MotorCare mengalami masalah.
                  </p>

                  <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-red-400/10 bg-black/20 p-4 font-mono text-[10px] leading-5 text-red-200/70">
                    {supabaseError}
                  </pre>

                  <p className="mt-3 text-[10px] text-white/25">
                    Jangan matikan RLS. Error ini kita cek dulu sebelum lanjut
                    ke fitur database.
                  </p>
                </div>
              </div>
            </div>
          )}

          {supabaseStatus === "connected" && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/[0.08] text-xs text-emerald-300">
                ✓
              </span>

              <div>
                <p className="text-[11px] font-semibold text-emerald-200/80">
                  Database connected
                </p>

                <p className="mt-0.5 text-[9px] text-emerald-200/35">
                  MotorCare berhasil terhubung ke Supabase.
                </p>
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {active === "Dashboard" && (
            <>
              <div className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                      {dashboardDateLabel}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                      Overview
                    </h2>

                    <p className="mt-2 text-sm text-white/30">
                      Pantau seluruh aktivitas MotorCare hari ini.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        realtimeStatus === "live"
                          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                          : realtimeStatus === "error"
                            ? "bg-red-400"
                            : "bg-blue-400"
                      }`}
                    />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">
                      {realtimeStatus === "live"
                        ? "Live database"
                        : realtimeStatus === "error"
                          ? "Sync error"
                          : "Connecting"}
                    </span>
                  </div>
                </div>
              </div>

              {/* LIVE STATS */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [
                    String(ownerRows.length).padStart(2, "0"),
                    "Pemilik Aktif",
                    "Database owners",
                  ],
                  [
                    String(motorRows.filter((motor) => motor.is_active).length).padStart(2, "0"),
                    "Motor Terdaftar",
                    "Motor aktif",
                  ],
                  [
                    String(dashboardTodaySchedules.length).padStart(2, "0"),
                    "Jadwal Hari Ini",
                    "Next date hari ini",
                  ],
                  [
                    formatRupiah(dashboardPaidTotal),
                    "Pembayaran Bulan Ini",
                    `${dashboardPaidThisMonth.length} pembayaran lunas`,
                  ],
                ].map(([value, label, caption]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/25">
                      {label}
                    </p>

                    <p className="mt-6 truncate text-2xl font-semibold tracking-[-0.035em]">
                      {value}
                    </p>

                    <p className="mt-1 text-[10px] text-emerald-300/50">
                      {caption}
                    </p>
                  </div>
                ))}
              </div>

              {/* DASHBOARD GRID */}
              <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
                <Panel
                  eyebrow="Schedule"
                  title="Jadwal hari ini"
                  action="Lihat semua"
                >
                  {scheduleLoading ? (
                    <div className="p-6 text-xs text-white/25">
                      Mengambil jadwal...
                    </div>
                  ) : dashboardTodaySchedules.length === 0 ? (
                    <div className="p-6">
                      <p className="text-sm font-semibold text-white/50">
                        Tidak ada jadwal hari ini.
                      </p>
                      <p className="mt-1 text-[10px] text-white/20">
                        Jadwal dengan next date hari ini akan muncul otomatis.
                      </p>
                    </div>
                  ) : (
                    dashboardTodaySchedules.slice(0, 4).map((item, index) => {
                      const motor = motorRows.find(
                        (motorRow) => motorRow.id === item.motor_id,
                      );
                      const completed = maintenanceRows.some(
                        (maintenanceRow) =>
                          maintenanceRow.motor_id === item.motor_id &&
                          maintenanceRow.date === dashboardToday &&
                          maintenanceRow.schedule_id === item.id,
                      );

                      return (
                        <div
                          key={item.id}
                          className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                            index !== 0
                              ? "border-t border-white/[0.05]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14">
                              <p className="font-mono text-sm font-semibold">
                                {item.time || "--:--"}
                              </p>
                              <p className="mt-1 text-[9px] text-white/20">
                                {item.next_date}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-semibold">
                                {motor
                                  ? `${motor.brand} ${motor.model}`.trim() || motor.name
                                  : "Motor"}
                              </p>
                              <p className="mt-1 text-[10px] text-white/30">
                                {item.service_type || "Motor Care"} · {item.frequency.replaceAll("_", " ")}
                              </p>
                            </div>
                          </div>

                          <Status text={completed ? "Selesai" : "Terjadwal"} />
                        </div>
                      );
                    })
                  )}
                </Panel>

                <Panel eyebrow="Payment" title="Ringkasan pembayaran">
                  <div className="p-5">
                    <p className="text-3xl font-semibold tracking-[-0.04em]">
                      {formatRupiah(dashboardPaidTotal)}
                    </p>

                    <p className="mt-2 text-[10px] text-white/25">
                      Total pembayaran lunas untuk {dashboardMonth}.
                    </p>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-blue-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(100, dashboardPaidTotal > 0 ? 100 : 0)}%`,
                        }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <MiniStat
                        label="Paid"
                        value={String(dashboardPaidThisMonth.length)}
                      />
                      <MiniStat
                        label="Pending"
                        value={String(dashboardPendingPayments)}
                      />
                    </div>
                  </div>
                </Panel>
              </div>

              {/* INVENTORY + TIMELINE */}
              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel eyebrow="Inventory" title="Stok produk">
                  {productLoading ? (
                    <div className="p-5 text-xs text-white/25">
                      Mengambil inventory...
                    </div>
                  ) : productRows.length === 0 ? (
                    <div className="p-5 text-xs text-white/25">
                      Inventory masih kosong.
                    </div>
                  ) : (
                    <>
                      {dashboardLowStock.length > 0 && (
                        <div className="mx-4 mt-4 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] px-4 py-3">
                          <p className="text-[10px] font-semibold text-amber-200/70">
                            {dashboardLowStock.length} produk perlu diperhatikan
                          </p>
                          <p className="mt-1 text-[9px] text-white/20">
                            Stok berada di atau di bawah minimum.
                          </p>
                        </div>
                      )}

                      {productRows
                        .filter((product) => product.is_active)
                        .slice(0, 4)
                        .map((product) => (
                          <ProductRow
                            key={product.id}
                            product={product}
                          />
                        ))}
                    </>
                  )}
                </Panel>

                <Panel eyebrow="Timeline" title="Aktivitas terbaru">
                  {dashboardTimeline.length === 0 ? (
                    <div className="p-5 text-xs text-white/25">
                      Belum ada aktivitas database.
                    </div>
                  ) : (
                    dashboardTimeline.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 border-b border-white/[0.05] p-4 last:border-0"
                      >
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />

                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold">
                            {item.title}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-white/30">
                            {item.detail}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[9px] text-white/20">
                              {item.timestamp.replace("T", " · ")}
                            </span>
                            <span className="text-[8px] uppercase tracking-[0.1em] text-blue-300/35">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </Panel>
              </div>

              {/* MONTHLY SNAPSHOT */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                    Perawatan Bulan Ini
                  </p>
                  <p className="mt-3 text-xl font-semibold">
                    {dashboardMaintenanceThisMonth}
                  </p>
                  <p className="mt-1 text-[9px] text-white/20">
                    record maintenance
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                    Jadwal Aktif
                  </p>
                  <p className="mt-3 text-xl font-semibold">
                    {scheduleRows.filter((item) => item.is_active).length}
                  </p>
                  <p className="mt-1 text-[9px] text-white/20">
                    semua motor
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                    Stok Menipis
                  </p>
                  <p className="mt-3 text-xl font-semibold">
                    {dashboardLowStock.length}
                  </p>
                  <p className="mt-1 text-[9px] text-white/20">
                    produk perlu dicek
                  </p>
                </div>
              </div>
            </>
          )}

          {/* PEMILIK */}
          {active === "Pemilik" && (
            <PageSection
              eyebrow="Customers"
              title="Pemilik"
              description="Kelola data pemilik dan motor yang mereka miliki."
              button="+ Tambah Pemilik"
              onButtonClick={() => openOwnerModal()}
            >
              {ownerLoading ? (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-sm text-white/30">
                  Mengambil data pemilik dari Supabase...
                </div>
              ) : ownerRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-400/[0.08] text-blue-300">
                    ◉
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">
                    Belum ada pemilik
                  </h3>
                  <p className="mt-2 text-[11px] text-white/25">
                    Tambahkan pemilik pertama untuk mulai membangun database
                    MotorCare.
                  </p>
                  <button
                    onClick={() => openOwnerModal()}
                    className="mt-5 rounded-full bg-white px-5 py-2.5 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100"
                  >
                    + Tambah Pemilik
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {ownerRows.map((owner) => (
                    <div
                      key={owner.id}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400/[0.08] text-sm font-semibold text-blue-300">
                          {owner.name.slice(0, 1).toUpperCase()}
                        </div>

                        <Status text={owner.is_public ? "Aktif" : "Private"} />
                      </div>

                      <h3 className="mt-5 text-base font-semibold">
                        {owner.name}
                      </h3>

                      <p className="mt-1 text-[11px] text-white/30">
                        {owner.phone}
                      </p>

                      <p className="mt-3 line-clamp-2 text-[10px] leading-5 text-white/20">
                        {owner.address}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <MiniStat
                          label="Motor"
                          value={String(motorRows.filter((motor) => motor.owner_id === owner.id).length)}
                        />
                        <MiniStat
                          label="Visibility"
                          value={owner.is_public ? "Public" : "Private"}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button type="button" onClick={() => openOwnerDetail(owner)} className="rounded-xl border border-white/[0.07] bg-white/[0.02] py-2.5 text-[9px] font-semibold text-white/40 hover:bg-white/[0.05] hover:text-white">Detail</button>
                        <button type="button" onClick={() => openOwnerModal(owner)} className="rounded-xl border border-blue-300/10 bg-blue-300/[0.03] py-2.5 text-[9px] font-semibold text-blue-200/60 hover:bg-blue-300/[0.07]">Edit</button>
                        <button type="button" onClick={() => deleteOwner(owner)} className="rounded-xl border border-red-300/10 bg-red-300/[0.02] py-2.5 text-[9px] font-semibold text-red-200/50 hover:bg-red-300/[0.06]">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PageSection>
          )}

          {/* MOTOR */}
          {active === "Motor" && (
            <PageSection
              eyebrow="Garage"
              title="Motor"
              description="Semua kendaraan yang terdaftar di MotorCare."
              button="+ Tambah Motor"
              onButtonClick={openMotorModal}
            >
              <DataTable
                headers={[
                  "Motor",
                  "Plat",
                  "Pemilik",
                  "Perawatan Terakhir",
                  "Jadwal Berikutnya",
                  "Status",
                  "Aksi",
                ]}
              >
                {motorLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-white/30">
                      Mengambil data motor dari Supabase...
                    </td>
                  </tr>
                ) : motorRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-white/30">
                      Belum ada motor. Klik “+ Tambah Motor” untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  motorRows.map((motor) => (
                    <tr key={motor.id} className="border-t border-white/[0.05]">
                      <td className="px-5 py-4 font-semibold">{motor.name}</td>
                      <td className="px-5 py-4 font-mono text-[10px] text-white/40">{motor.plate_number}</td>
                      <td className="px-5 py-4 text-white/40">{ownerRows.find((owner) => owner.id === motor.owner_id)?.name || "-"}</td>
                      <td className="px-5 py-4 text-white/40">-</td>
                      <td className="px-5 py-4 text-white/40">-</td>
                      <td className="px-5 py-4"><Status text={motor.is_active ? "Ready" : "Inactive"} /></td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => openMotorModal(motor)} className="rounded-lg border border-blue-300/10 px-2.5 py-1.5 text-[9px] font-semibold text-blue-200/60 hover:bg-blue-300/[0.06]">Edit</button>
                          <button type="button" onClick={() => deleteMotor(motor)} className="rounded-lg border border-red-300/10 px-2.5 py-1.5 text-[9px] font-semibold text-red-200/50 hover:bg-red-300/[0.06]">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </PageSection>
          )}

          {/* JADWAL */}
          {active === "Jadwal" && (
            <PageSection
              eyebrow="Schedule"
              title="Jadwal"
              description="Atur jadwal perawatan setiap motor."
              button="+ Buat Jadwal"
              onButtonClick={() => openScheduleModal()}
            >
              {scheduleLoading ? (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-sm text-white/30">
                  Mengambil jadwal dari Supabase...
                </div>
              ) : scheduleRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-400/[0.08] text-blue-300">◷</div>
                  <h3 className="mt-4 text-sm font-semibold">Belum ada jadwal</h3>
                  <p className="mt-2 text-[11px] text-white/25">Buat jadwal pertama untuk mengatur perawatan rutin motor.</p>
                  <button
                    onClick={() => openScheduleModal()}
                    disabled={motorRows.length === 0}
                    className="mt-5 rounded-full bg-white px-5 py-2.5 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    + Buat Jadwal
                  </button>
                  {motorRows.length === 0 && <p className="mt-3 text-[9px] text-amber-300/50">Tambahkan motor terlebih dahulu.</p>}
                </div>
              ) : (
                <div className="grid gap-3">
                  {scheduleRows.map((item) => {
                    const motor = motorRows.find((row) => row.id === item.motor_id);
                    return (
                      <div key={item.id} className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:flex-row sm:items-center">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
                          <p className="text-sm font-semibold">{item.next_date ? item.next_date.slice(8, 10) : "--"}</p>
                          <p className="text-[8px] uppercase text-white/25">{item.next_date ? item.next_date.slice(5, 7) : "-"}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold">{motor?.name || "Motor tidak ditemukan"}</h3>
                            <Status text={item.is_active ? "Terjadwal" : "Inactive"} />
                          </div>
                          <p className="mt-2 text-[11px] text-white/30">{item.time} · {item.service_type} · {item.frequency}</p>
                          <p className="mt-1 text-[9px] text-white/20">{motor ? `${motor.brand} ${motor.model} · ${motor.plate_number}` : ""}</p>
                          <div className="mt-4 flex gap-2">
                            <button type="button" onClick={() => openScheduleModal(item)} className="rounded-lg border border-blue-300/10 px-3 py-1.5 text-[9px] font-semibold text-blue-200/60 hover:bg-blue-300/[0.06]">Edit</button>
                            <button type="button" onClick={() => deleteSchedule(item)} className="rounded-lg border border-red-300/10 px-3 py-1.5 text-[9px] font-semibold text-red-200/50 hover:bg-red-300/[0.06]">Hapus</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PageSection>
          )}

          {/* PERAWATAN */}
          {active === "Perawatan" && (
            <PageSection
              eyebrow="Maintenance"
              title="Perawatan / Cuci"
              description="Catat aktivitas cuci, maintenance, dan hubungkan dengan jadwal."
              button="+ Catat Perawatan"
              onButtonClick={() => openMaintenanceModal()}
            >
              {maintenanceLoading ? (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-sm text-white/30">
                  Mengambil riwayat perawatan dari Supabase...
                </div>
              ) : maintenanceRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-400/[0.08] text-blue-300">✦</div>
                  <h3 className="mt-4 text-sm font-semibold">Belum ada perawatan</h3>
                  <p className="mt-2 text-[11px] text-white/25">Catat cuci atau maintenance pertama untuk mulai membangun riwayat.</p>
                  <button
                    onClick={() => openMaintenanceModal()}
                    disabled={motorRows.length === 0}
                    className="mt-5 rounded-full bg-white px-5 py-2.5 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    + Catat Perawatan
                  </button>
                  {motorRows.length === 0 && <p className="mt-3 text-[9px] text-amber-300/50">Tambahkan motor terlebih dahulu.</p>}
                </div>
              ) : (
                <DataTable
                  headers={[
                    "Tanggal",
                    "Motor",
                    "Jam",
                    "Status",
                    "Catatan",
                    "Aksi",
                  ]}
                >
                  {maintenanceRows.map((item) => {
                    const motor = motorRows.find((row) => row.id === item.motor_id);
                    return (
                      <tr key={item.id} className="border-t border-white/[0.05]">
                        <td className="px-5 py-4 text-white/40">{item.date}</td>
                        <td className="px-5 py-4 font-semibold">{motor?.name || "Motor tidak ditemukan"}</td>
                        <td className="px-5 py-4 text-white/40">{item.start_time} — {item.end_time}</td>
                        <td className="px-5 py-4"><Status text={item.status} /></td>
                        <td className="max-w-[280px] px-5 py-4 text-[10px] text-white/30">{item.notes || "-"}</td>
                        <td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => openMaintenanceModal(item)} className="rounded-lg border border-blue-300/10 px-2.5 py-1.5 text-[9px] font-semibold text-blue-200/60">Edit</button><button type="button" onClick={() => deleteMaintenance(item)} className="rounded-lg border border-red-300/10 px-2.5 py-1.5 text-[9px] font-semibold text-red-200/50">Hapus</button></div></td>
                      </tr>
                    );
                  })}
                </DataTable>
              )}
            </PageSection>
          )}

          {/* PEMBAYARAN */}
          {active === "Pembayaran" && (
            <PageSection
              eyebrow="Finance"
              title="Pembayaran"
              description="Kelola pembayaran berdasarkan pemilik dan periode."
              button="+ Catat Pembayaran"
              onButtonClick={() => openPaymentModal()}
            >
              {paymentLoading ? (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-white/30">Mengambil pembayaran dari Supabase...</div>
              ) : paymentRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-10 text-center">
                  <p className="text-sm font-semibold">Belum ada pembayaran</p>
                  <p className="mt-1 text-[10px] text-white/25">Catat pembayaran pertama untuk mulai membangun riwayat finance.</p>
                  <button type="button" onClick={() => openPaymentModal()} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-[10px] font-semibold text-[#080a0d]">+ Catat Pembayaran</button>
                </div>
              ) : (
                <DataTable headers={["Tanggal", "Pemilik", "Periode", "Nominal", "Metode", "Status", "Aksi"]}>
                  {paymentRows.map((payment) => (
                    <tr key={payment.id} className="border-t border-white/[0.05]">
                      <td className="px-5 py-4 text-white/40">{payment.paid_at || "-"}</td>
                      <td className="px-5 py-4 font-semibold">{ownerRows.find((owner) => owner.id === payment.owner_id)?.name || "Pemilik"}</td>
                      <td className="px-5 py-4 text-white/40">{payment.period}</td>
                      <td className="px-5 py-4 font-semibold">{formatRupiah(payment.amount)}</td>
                      <td className="px-5 py-4 text-white/40">{payment.payment_method}</td>
                      <td className="px-5 py-4"><Status text={payment.status} /></td>
                      <td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => openPaymentModal(payment)} className="rounded-lg border border-blue-300/10 px-2.5 py-1.5 text-[9px] font-semibold text-blue-200/60">Edit</button><button type="button" onClick={() => deletePayment(payment)} className="rounded-lg border border-red-300/10 px-2.5 py-1.5 text-[9px] font-semibold text-red-200/50">Hapus</button></div></td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </PageSection>
          )}

          {/* PRODUK */}
          {active === "Produk & Alat" && (
            <PageSection
              eyebrow="Inventory"
              title="Produk & Alat"
              description="Kelola stok produk dan alat yang digunakan saat perawatan."
              button="+ Tambah Produk"
              onButtonClick={() => openProductModal()}
            >
              {productLoading ? (
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-white/30">
                  Mengambil inventory dari Supabase...
                </div>
              ) : productRows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.015] p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-400/[0.08] text-blue-300">▣</div>
                  <p className="mt-4 text-sm font-semibold">Inventory masih kosong</p>
                  <p className="mt-1 text-[10px] text-white/25">Tambahkan KIT, wax, semir ban, microfiber, atau alat lainnya.</p>
                  <button type="button" onClick={() => openProductModal()} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-[10px] font-semibold text-[#080a0d]">+ Tambah Produk</button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {productRows.map((product) => {
                    const status = getProductStatus(product);
                    return (
                      <div key={product.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-sm text-white/30">▣</div>
                          <Status text={status} />
                        </div>
                        <h3 className="mt-5 text-sm font-semibold">{product.name}</h3>
                        <p className="mt-1 text-[10px] text-white/25">{product.brand !== "-" ? `${product.brand} · ` : ""}{product.category}</p>
                        <div className="mt-7 flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-semibold">{product.stock}</p>
                            <p className="text-[9px] uppercase tracking-[0.12em] text-white/20">{product.unit}</p>
                          </div>
                          <p className="text-[9px] text-white/20">Min. {product.low_stock_threshold}</p>
                        </div>
                        <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5">
                          <span className="text-[9px] text-white/25">Tracking stok</span>
                          <span className={`text-[9px] font-semibold ${product.track_stock ? "text-emerald-300/60" : "text-white/25"}`}>{product.track_stock ? "ON" : "OFF"}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => openStockModal(product, "add")} disabled={!product.track_stock || !product.is_active} className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.04] py-2.5 text-[9px] font-semibold text-emerald-200/60 hover:bg-emerald-300/[0.08] disabled:cursor-not-allowed disabled:opacity-25">+ Stok</button>
                          <button type="button" onClick={() => openStockModal(product, "subtract")} disabled={!product.track_stock || !product.is_active || product.stock <= 0} className="rounded-xl border border-amber-300/10 bg-amber-300/[0.04] py-2.5 text-[9px] font-semibold text-amber-200/60 hover:bg-amber-300/[0.08] disabled:cursor-not-allowed disabled:opacity-25">− Stok</button>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <button type="button" onClick={() => openProductModal(product)} className="rounded-xl border border-white/[0.07] py-2.5 text-[9px] font-semibold text-white/40 hover:bg-white/[0.04] hover:text-white">Edit</button>
                          <button type="button" onClick={() => archiveProduct(product)} disabled={!product.is_active} className="rounded-xl border border-amber-300/10 py-2.5 text-[9px] font-semibold text-amber-200/40 hover:bg-amber-300/[0.05] disabled:cursor-not-allowed disabled:opacity-25">{product.is_active ? "Arsip" : "Arsip"}</button>
                          <button type="button" onClick={() => deleteProduct(product)} className="rounded-xl border border-red-300/10 py-2.5 text-[9px] font-semibold text-red-200/50 hover:bg-red-300/[0.05]">Hapus</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </PageSection>
          )}

          {/* RIWAYAT */}
          {active === "Riwayat" && (
            <PageSection
              eyebrow="History"
              title="Riwayat"
              description="Timeline aktivitas MotorCare yang tersimpan di database."
            >
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-blue-300/10 bg-blue-300/[0.025] px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold text-blue-200/70">
                    Database history aktif
                  </p>
                  <p className="mt-1 text-[9px] text-white/20">
                    Menampilkan perawatan, pembayaran, jadwal, dan penggunaan produk.
                  </p>
                </div>
                <span className="text-[9px] font-semibold text-white/25">
                  {historyRows.length} aktivitas
                </span>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                {historyRows.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-400/[0.08] text-blue-300">
                      ↻
                    </div>
                    <p className="mt-4 text-sm font-semibold">Belum ada riwayat</p>
                    <p className="mt-1 text-[10px] text-white/25">
                      Aktivitas yang tersimpan di Supabase akan muncul di sini.
                    </p>
                  </div>
                ) : (
                  historyRows.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex gap-5 p-5 ${
                        index !== historyRows.length - 1
                          ? "border-b border-white/[0.05]"
                          : ""
                      }`}
                    >
                      <div className="relative flex w-5 shrink-0 justify-center">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.35)]" />
                        {index !== historyRows.length - 1 && (
                          <span className="absolute top-4 h-[calc(100%+20px)] w-px bg-white/[0.06]" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                          <div>
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-1 text-[11px] text-white/35">
                              {item.detail}
                            </p>
                          </div>

                          <div className="flex flex-col items-start gap-1 sm:items-end">
                            <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-white/30">
                              {item.type}
                            </span>
                            <span className="text-[9px] text-white/20">
                              {formatHistoryDate(item.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PageSection>
          )}

          {/* MOTOR MODAL */}
          {motorModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button aria-label="Close motor modal" onClick={closeMotorModal} className="absolute inset-0 cursor-default" />
              <div className="relative z-10 w-full max-w-[620px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">Garage</p>
                    <h3 className="mt-1 text-lg font-semibold">{editingMotorId ? "Edit Motor" : "Tambah Motor"}</h3>
                    <p className="mt-1 text-[10px] text-white/25">Hubungkan motor ke pemilik dan simpan ke database MotorCare.</p>
                  </div>
                  <button onClick={closeMotorModal} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white">×</button>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Pemilik *</span>
                    <select value={motorForm.owner_id} onChange={(e) => setMotorForm((c) => ({ ...c, owner_id: e.target.value }))} className="w-full rounded-xl border border-white/[0.08] bg-[#11161d] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30">
                      {motorForm.owner_id && <p className="mt-2 text-[9px] text-white/25">Motor pemilik ini: {motorRows.filter((m) => m.owner_id === motorForm.owner_id && m.id !== editingMotorId).length}/5</p>}
                      <option value="">Pilih pemilik</option>
                      {ownerRows.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                    </select>
                  </label>
                  <FormField label="Nama motor *" value={motorForm.name} placeholder="Contoh: PCX 160" onChange={(value) => setMotorForm((c) => ({ ...c, name: value }))} />
                  <FormField label="Merek" value={motorForm.brand} placeholder="Honda / Yamaha" onChange={(value) => setMotorForm((c) => ({ ...c, brand: value }))} />
                  <FormField label="Model" value={motorForm.model} placeholder="PCX 160" onChange={(value) => setMotorForm((c) => ({ ...c, model: value }))} />
                  <FormField label="Plat nomor" value={motorForm.plate_number} placeholder="F 1234 ABC" onChange={(value) => setMotorForm((c) => ({ ...c, plate_number: value }))} />
                  <FormField label="Tahun" value={motorForm.year} placeholder="2026" onChange={(value) => setMotorForm((c) => ({ ...c, year: value }))} />
                  <FormField label="Warna" value={motorForm.color} placeholder="Hitam" onChange={(value) => setMotorForm((c) => ({ ...c, color: value }))} />
                  <div className="sm:col-span-2">
                    <FormField label="Catatan" value={motorForm.notes} placeholder="Catatan motor..." textarea onChange={(value) => setMotorForm((c) => ({ ...c, notes: value }))} />
                  </div>
                  {motorFormError && <div className="sm:col-span-2 rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-[10px] leading-5 text-red-200/70">{motorFormError}</div>}
                  <div className="sm:col-span-2 flex gap-2 pt-2">
                    <button onClick={closeMotorModal} disabled={motorSaving} className="flex-1 rounded-xl border border-white/[0.08] py-3 text-[10px] font-semibold text-white/40 hover:bg-white/[0.04] hover:text-white disabled:opacity-40">Batal</button>
                    <button onClick={saveMotor} disabled={motorSaving || ownerRows.length === 0} className="flex-1 rounded-xl bg-white py-3 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">{motorSaving ? "Menyimpan..." : editingMotorId ? "Simpan Perubahan" : "Simpan Motor"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAINTENANCE MODAL */}
          {maintenanceModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button aria-label="Close maintenance modal" onClick={closeMaintenanceModal} className="absolute inset-0 cursor-default" />
              <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">Maintenance</p>
                    <h3 className="mt-1 text-lg font-semibold">{editingMaintenanceId ? "Edit Perawatan" : "Catat Perawatan"}</h3>
                    <p className="mt-1 text-[10px] text-white/25">Simpan aktivitas cuci atau maintenance ke database.</p>
                  </div>
                  <button onClick={closeMaintenanceModal} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white">×</button>
                </div>

                <div className="space-y-4 p-6">
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Motor *</span>
                    <select
                      value={maintenanceForm.motor_id}
                      onChange={(event) => setMaintenanceForm((current) => ({ ...current, motor_id: event.target.value, schedule_id: "" }))}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30"
                    >
                      <option value="">Pilih motor</option>
                      {motorRows.map((motor) => (
                        <option key={motor.id} value={motor.id}>{motor.name} · {motor.plate_number}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Jadwal terkait</span>
                    <select
                      value={maintenanceForm.schedule_id}
                      onChange={(event) => setMaintenanceForm((current) => ({ ...current, schedule_id: event.target.value }))}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30"
                    >
                      <option value="">Tidak terkait jadwal</option>
                      {scheduleRows.filter((schedule) => schedule.motor_id === maintenanceForm.motor_id).map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>{schedule.service_type} · {schedule.frequency}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Tanggal *" value={maintenanceForm.date} placeholder="2026-09-14" onChange={(value) => setMaintenanceForm((current) => ({ ...current, date: value }))} />
                    <label className="block">
                      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Status</span>
                      <select value={maintenanceForm.status} onChange={(event) => setMaintenanceForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30">
                        <option value="Selesai">Selesai</option>
                        <option value="Dikerjakan">Dikerjakan</option>
                        <option value="Batal">Batal</option>
                      </select>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Produk digunakan</p>
                        <p className="mt-1 text-[10px] text-white/20">Isi jumlah hanya untuk produk yang dipakai.</p>
                      </div>
                      <span className="text-[9px] text-white/20">Opsional</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {productRows.filter((product) => product.is_active).map((product) => (
                        <div key={product.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/10 px-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold">{product.name}</p>
                            <p className="mt-0.5 text-[8px] text-white/20">Stok {product.stock} {product.unit}{product.track_stock ? "" : " · tracking off"}</p>
                          </div>
                          <input type="number" min="0" step="1" value={usageDraft[product.id] || ""} onChange={(event) => setUsageDraft((current) => ({ ...current, [product.id]: event.target.value }))} placeholder="0" className="w-20 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-2 text-right text-[10px] text-white outline-none focus:border-blue-400/30" />
                          <span className="w-8 text-[8px] text-white/20">{product.unit}</span>
                        </div>
                      ))}
                      {productRows.filter((product) => product.is_active).length === 0 && <p className="py-3 text-[10px] text-white/20">Belum ada produk aktif di inventory.</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Jam mulai *" value={maintenanceForm.start_time} placeholder="09:00" onChange={(value) => setMaintenanceForm((current) => ({ ...current, start_time: value }))} />
                    <FormField label="Jam selesai *" value={maintenanceForm.end_time} placeholder="09:45" onChange={(value) => setMaintenanceForm((current) => ({ ...current, end_time: value }))} />
                  </div>

                  <FormField label="Catatan" value={maintenanceForm.notes} placeholder="Contoh: body dicuci, wax selesai..." textarea onChange={(value) => setMaintenanceForm((current) => ({ ...current, notes: value }))} />

                  {maintenanceFormError && <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-[10px] leading-5 text-red-200/70">{maintenanceFormError}</div>}

                  <div className="flex gap-2 pt-2">
                    <button onClick={closeMaintenanceModal} disabled={maintenanceSaving} className="flex-1 rounded-xl border border-white/[0.08] py-3 text-[10px] font-semibold text-white/40 hover:bg-white/[0.04] hover:text-white disabled:opacity-40">Batal</button>
                    <button onClick={saveMaintenance} disabled={maintenanceSaving || motorRows.length === 0} className="flex-1 rounded-xl bg-white py-3 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">{maintenanceSaving ? "Menyimpan..." : editingMaintenanceId ? "Simpan Perubahan" : "Simpan Perawatan"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE MODAL */}
          {scheduleModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button aria-label="Close schedule modal" onClick={closeScheduleModal} className="absolute inset-0 cursor-default" />
              <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">Schedule</p>
                    <h3 className="mt-1 text-lg font-semibold">{editingScheduleId ? "Edit Jadwal" : "Buat Jadwal"}</h3>
                    <p className="mt-1 text-[10px] text-white/25">Jadwal disimpan langsung ke database MotorCare.</p>
                  </div>
                  <button onClick={closeScheduleModal} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white">×</button>
                </div>

                <div className="space-y-4 p-6">
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Motor *</span>
                    <select
                      value={scheduleForm.motor_id}
                      onChange={(event) => setScheduleForm((current) => ({ ...current, motor_id: event.target.value }))}
                      className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30"
                    >
                      <option value="">Pilih motor</option>
                      {motorRows.map((motor) => (
                        <option key={motor.id} value={motor.id}>{motor.name} · {motor.plate_number}</option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Frekuensi</span>
                      <select value={scheduleForm.frequency} onChange={(event) => setScheduleForm((current) => ({ ...current, frequency: event.target.value }))} className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30">
                        <option value="one_time">One Time</option>
                        <option value="weekly">Weekly</option>
                        <option value="every_2_weeks">Every 2 Weeks</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                    <FormField label="Jam" value={scheduleForm.time} placeholder="09:00" onChange={(value) => setScheduleForm((current) => ({ ...current, time: value }))} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Tanggal berikutnya *" value={scheduleForm.next_date} placeholder="2026-09-14" onChange={(value) => setScheduleForm((current) => ({ ...current, next_date: value }))} />
                    <label className="block">
                      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Hari</span>
                      <select value={scheduleForm.day_of_week} onChange={(event) => setScheduleForm((current) => ({ ...current, day_of_week: event.target.value }))} className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30">
                        <option value="0">Minggu</option><option value="1">Senin</option><option value="2">Selasa</option><option value="3">Rabu</option><option value="4">Kamis</option><option value="5">Jumat</option><option value="6">Sabtu</option>
                      </select>
                    </label>
                  </div>

                  <FormField label="Jenis layanan" value={scheduleForm.service_type} placeholder="Full Wash" onChange={(value) => setScheduleForm((current) => ({ ...current, service_type: value }))} />

                  {scheduleFormError && <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-[10px] leading-5 text-red-200/70">{scheduleFormError}</div>}

                  {motorRows.length === 0 && <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.04] p-3 text-[10px] leading-5 text-amber-200/60">Belum ada motor. Tambahkan motor dulu di menu Motor.</div>}

                  <div className="flex gap-2 pt-2">
                    <button onClick={closeScheduleModal} disabled={scheduleSaving} className="flex-1 rounded-xl border border-white/[0.08] py-3 text-[10px] font-semibold text-white/40 hover:bg-white/[0.04] hover:text-white disabled:opacity-40">Batal</button>
                    <button onClick={saveSchedule} disabled={scheduleSaving || motorRows.length === 0} className="flex-1 rounded-xl bg-white py-3 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60">{scheduleSaving ? "Menyimpan..." : editingScheduleId ? "Simpan Perubahan" : "Simpan Jadwal"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENT MODAL */}
          {paymentModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button aria-label="Close payment modal" onClick={closePaymentModal} className="absolute inset-0 cursor-default" />
              <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">Finance</p><h3 className="mt-1 text-lg font-semibold">{editingPaymentId ? "Edit Pembayaran" : "Catat Pembayaran"}</h3><p className="mt-1 text-[10px] text-white/25">Data pembayaran tersimpan di Supabase.</p></div>
                  <button onClick={closePaymentModal} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white">×</button>
                </div>
                <div className="space-y-4 p-6">
                  <label className="block"><span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Pemilik *</span><select value={paymentForm.owner_id} onChange={(e) => setPaymentForm((c) => ({...c, owner_id:e.target.value}))} className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30"><option value="">Pilih pemilik</option>{ownerRows.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</select></label>
                  <div className="grid gap-4 sm:grid-cols-2"><FormField label="Periode *" value={paymentForm.period} placeholder="2026-09" onChange={(value) => setPaymentForm((c) => ({...c, period:value}))} /><FormField label="Nominal *" value={paymentForm.amount} placeholder="300000" onChange={(value) => setPaymentForm((c) => ({...c, amount:value}))} /></div>
                  <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Status</span><select value={paymentForm.status} onChange={(e) => setPaymentForm((c) => ({...c, status:e.target.value}))} className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none"><option value="Paid">Paid</option><option value="Pending">Pending</option></select></label><label className="block"><span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Metode</span><select value={paymentForm.payment_method} onChange={(e) => setPaymentForm((c) => ({...c, payment_method:e.target.value}))} className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none"><option>Transfer</option><option>Cash</option><option>QRIS</option></select></label></div>
                  {paymentForm.status === "Paid" && <FormField label="Tanggal bayar" value={paymentForm.paid_at} placeholder="2026-09-14" onChange={(value) => setPaymentForm((c) => ({...c, paid_at:value}))} />}
                  <FormField label="Catatan admin (private)" value={paymentForm.admin_notes} placeholder="Catatan internal..." textarea onChange={(value) => setPaymentForm((c) => ({...c, admin_notes:value}))} />
                  {paymentFormError && <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-[10px] leading-5 text-red-200/70">{paymentFormError}</div>}
                  <div className="flex gap-2 pt-2"><button onClick={closePaymentModal} disabled={paymentSaving} className="flex-1 rounded-xl border border-white/[0.08] py-3 text-[10px] font-semibold text-white/40">Batal</button><button onClick={savePayment} disabled={paymentSaving || ownerRows.length===0} className="flex-1 rounded-xl bg-white py-3 text-[10px] font-semibold text-[#080a0d] disabled:opacity-50">{paymentSaving ? "Menyimpan..." : editingPaymentId ? "Simpan Perubahan" : "Simpan Pembayaran"}</button></div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCT MODAL */}
          {productModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button aria-label="Close product modal" onClick={closeProductModal} className="absolute inset-0 cursor-default" />
              <div className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">Inventory</p>
                    <h3 className="mt-1 text-lg font-semibold">{editingProductId ? "Edit Produk / Alat" : "Tambah Produk / Alat"}</h3>
                    <p className="mt-1 text-[10px] text-white/25">Data inventory disimpan langsung ke Supabase.</p>
                  </div>
                  <button type="button" onClick={closeProductModal} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white">×</button>
                </div>

                <div className="space-y-4 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Nama produk / alat *" value={productForm.name} placeholder="KIT Shampoo" onChange={(value) => setProductForm((current) => ({ ...current, name: value }))} />
                    <FormField label="Merek" value={productForm.brand} placeholder="KIT" onChange={(value) => setProductForm((current) => ({ ...current, brand: value }))} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">Kategori</span>
                      <select value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-xl border border-white/[0.08] bg-[#10151b] px-3.5 py-3 text-[11px] text-white outline-none focus:border-blue-400/30">
                        <option value="Cleaning">Cleaning</option>
                        <option value="Protection">Protection</option>
                        <option value="Detailing">Detailing</option>
                        <option value="Tools">Tools</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <FormField label="Satuan *" value={productForm.unit} placeholder="botol / pcs / liter" onChange={(value) => setProductForm((current) => ({ ...current, unit: value }))} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Stok awal *" value={productForm.stock} placeholder="8" onChange={(value) => setProductForm((current) => ({ ...current, stock: value }))} />
                    <FormField label="Batas stok minimum" value={productForm.low_stock_threshold} placeholder="2" onChange={(value) => setProductForm((current) => ({ ...current, low_stock_threshold: value }))} />
                  </div>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                    <div>
                      <p className="text-[10px] font-semibold">Tracking stok</p>
                      <p className="mt-1 text-[9px] text-white/20">Stok akan bisa dikurangi saat produk dipakai.</p>
                    </div>
                    <input type="checkbox" checked={productForm.track_stock} onChange={(event) => setProductForm((current) => ({ ...current, track_stock: event.target.checked }))} className="h-4 w-4 accent-blue-400" />
                  </label>

                  <FormField label="Catatan" value={productForm.notes} placeholder="Contoh: khusus body motor..." textarea onChange={(value) => setProductForm((current) => ({ ...current, notes: value }))} />

                  {productFormError && <div className="whitespace-pre-line rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-[10px] leading-5 text-red-200/70">{productFormError}</div>}

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={closeProductModal} disabled={productSaving} className="flex-1 rounded-xl border border-white/[0.08] py-3 text-[10px] font-semibold text-white/40 hover:bg-white/[0.04] hover:text-white disabled:opacity-40">Batal</button>
                    <button type="button" onClick={saveProduct} disabled={productSaving} className="flex-1 rounded-xl bg-white py-3 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60">{productSaving ? "Menyimpan..." : editingProductId ? "Simpan Perubahan" : "Simpan Produk"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STOCK MODAL */}
          {stockModalProduct && (
            <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button aria-label="Close stock modal" onClick={closeStockModal} className="absolute inset-0 cursor-default" />
              <div className="relative z-10 w-full max-w-[430px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">Inventory</p>
                    <h3 className="mt-1 text-lg font-semibold">{stockAction === "add" ? "Tambah Stok" : "Kurangi Stok"}</h3>
                    <p className="mt-1 text-[10px] text-white/25">{stockModalProduct.name} · stok saat ini {stockModalProduct.stock} {stockModalProduct.unit}</p>
                  </div>
                  <button type="button" onClick={closeStockModal} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white">×</button>
                </div>
                <div className="space-y-4 p-6">
                  <FormField label="Jumlah" value={stockAmount} placeholder="Contoh: 2" onChange={setStockAmount} />
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/25">Stok setelah perubahan</span>
                      <span className="font-semibold text-white">{stockAmount && Number.isInteger(Number(stockAmount)) && Number(stockAmount) >= 0 ? Math.max(0, stockAction === "add" ? stockModalProduct.stock + Number(stockAmount) : stockModalProduct.stock - Number(stockAmount)) : stockModalProduct.stock} {stockModalProduct.unit}</span>
                    </div>
                  </div>
                  {stockError && <div className="whitespace-pre-line rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-[10px] leading-5 text-red-200/70">{stockError}</div>}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={closeStockModal} disabled={stockSaving} className="flex-1 rounded-xl border border-white/[0.08] py-3 text-[10px] font-semibold text-white/40 hover:bg-white/[0.04] hover:text-white disabled:opacity-40">Batal</button>
                    <button type="button" onClick={adjustStock} disabled={stockSaving} className="flex-1 rounded-xl bg-white py-3 text-[10px] font-semibold text-[#080a0d] hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60">{stockSaving ? "Menyimpan..." : "Simpan Stok"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OWNER DETAIL MODAL */}
          {selectedOwner && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button
                aria-label="Close owner detail"
                onClick={closeOwnerDetail}
                className="absolute inset-0 cursor-default"
              />

              <div className="relative z-10 max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">
                      Customer profile
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{selectedOwner.name}</h3>
                    <p className="mt-1 text-[10px] text-white/25">Detail pemilik dan kendaraan yang terdaftar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeOwnerDetail}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-3">
                  <MiniStat label="Motor" value={String(motorRows.filter((motor) => motor.owner_id === selectedOwner.id).length)} />
                  <MiniStat label="Status" value={selectedOwner.is_public ? "Aktif" : "Private"} />
                  <MiniStat label="Telepon" value={selectedOwner.phone} />
                </div>

                <div className="px-6 pb-6">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">Informasi</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-white/20">Nomor telepon</p>
                        <p className="mt-1 text-[11px] text-white/65">{selectedOwner.phone}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.12em] text-white/20">Alamat</p>
                        <p className="mt-1 text-[11px] leading-5 text-white/65">{selectedOwner.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">Garage</p>
                        <h4 className="mt-1 text-sm font-semibold">Motor terdaftar</h4>
                      </div>
                      <span className="rounded-full border border-blue-400/10 bg-blue-400/[0.06] px-3 py-1.5 text-[9px] font-semibold text-blue-200/70">
                        {motorRows.filter((motor) => motor.owner_id === selectedOwner.id).length}/2 motor
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {motorRows.filter((motor) => motor.owner_id === selectedOwner.id).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/[0.08] p-5 text-center text-[10px] text-white/25">
                          Belum ada motor untuk pemilik ini.
                        </div>
                      ) : (
                        motorRows
                          .filter((motor) => motor.owner_id === selectedOwner.id)
                          .map((motor) => (
                            <div key={motor.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold">{motor.name}</p>
                                <p className="mt-1 text-[9px] text-white/25">
                                  {[motor.brand, motor.model].filter((item) => item && item !== "-").join(" · ") || "Detail belum diisi"}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="font-mono text-[10px] text-white/50">{motor.plate_number}</p>
                                <p className="mt-1 text-[8px] text-white/20">{motor.color}</p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {selectedOwner.notes && (
                    <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">Catatan admin</p>
                      <p className="mt-3 text-[10px] leading-5 text-white/35">{selectedOwner.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OWNER MODAL */}
          {ownerModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
              <button
                aria-label="Close owner modal"
                onClick={closeOwnerModal}
                className="absolute inset-0 cursor-default"
              />

              <div className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0b0f14] shadow-2xl">
                <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">
                      Customers
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      Tambah Pemilik
                    </h3>
                    <p className="mt-1 text-[10px] text-white/25">
                      Data akan disimpan langsung ke database MotorCare.
                    </p>
                  </div>

                  <button
                    onClick={closeOwnerModal}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-sm text-white/35 hover:bg-white/[0.05] hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 p-6">
                  <FormField
                    label="Nama pemilik *"
                    value={ownerForm.name}
                    placeholder="Contoh: Fairuz"
                    onChange={(value) =>
                      setOwnerForm((current) => ({
                        ...current,
                        name: value,
                      }))
                    }
                  />

                  <FormField
                    label="No. HP"
                    value={ownerForm.phone}
                    placeholder="08xxxxxxxxxx"
                    onChange={(value) =>
                      setOwnerForm((current) => ({
                        ...current,
                        phone: value,
                      }))
                    }
                  />

                  <FormField
                    label="Alamat"
                    value={ownerForm.address}
                    placeholder="Alamat pemilik"
                    onChange={(value) =>
                      setOwnerForm((current) => ({
                        ...current,
                        address: value,
                      }))
                    }
                  />

                  <FormField
                    label="Catatan"
                    value={ownerForm.notes}
                    placeholder="Catatan internal..."
                    textarea
                    onChange={(value) =>
                      setOwnerForm((current) => ({
                        ...current,
                        notes: value,
                      }))
                    }
                  />

                  {ownerFormError && (
                    <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-[10px] leading-5 text-red-200/70">
                      {ownerFormError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={closeOwnerModal}
                      disabled={ownerSaving}
                      className="flex-1 rounded-xl border border-white/[0.08] py-3 text-[10px] font-semibold text-white/40 hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
                    >
                      Batal
                    </button>

                    <button
                      onClick={saveOwner}
                      disabled={ownerSaving}
                      className="flex-1 rounded-xl bg-white py-3 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60"
                    >
                      {ownerSaving ? "Menyimpan..." : editingOwnerId ? "Simpan Perubahan" : "Simpan Pemilik"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-10 border-t border-white/[0.06] pt-6 text-[9px] uppercase tracking-[0.13em] text-white/20">
            MotorCare Admin System · 2026
          </footer>
        </div>
      </div>
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function Panel({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.018]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5 sm:px-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-300/60">
            {eyebrow}
          </p>

          <h3 className="mt-1 text-base font-semibold">{title}</h3>
        </div>

        {action && (
          <button className="text-[9px] font-semibold text-white/25 hover:text-white">
            {action} →
          </button>
        )}
      </div>

      {children}
    </section>
  );
}

function PageSection({
  eyebrow,
  title,
  description,
  button,
  onButtonClick,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  button?: string;
  onButtonClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300/60">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            {title}
          </h2>

          <p className="mt-2 text-sm text-white/30">{description}</p>
        </div>

        {button && (
          <button
            onClick={onButtonClick}
            className="w-fit rounded-full bg-white px-5 py-2.5 text-[10px] font-semibold text-[#080a0d] transition hover:bg-blue-100"
          >
            {button}
          </button>
        )}
      </div>

      {children}
    </>
  );
}

function FormField({
  label,
  value,
  placeholder,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  const className =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 text-[11px] text-white outline-none placeholder:text-white/15 focus:border-blue-400/30 focus:bg-white/[0.035]";

  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">
        {label}
      </span>

      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={`${className} resize-none`}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-white/[0.07] bg-white/[0.018]">
      <table className="w-full min-w-[850px] border-collapse text-left text-[11px]">
        <thead>
          <tr className="bg-white/[0.02]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-5 py-4 text-[9px] font-semibold uppercase tracking-[0.13em] text-white/25"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Status({ text }: { text: string }) {
  const positive =
    text === "Selesai" ||
    text === "Completed" ||
    text === "Paid" ||
    text === "Ready" ||
    text === "Aktif" ||
    text === "Aman";

  const warning =
    text === "Pending" ||
    text === "Menunggu" ||
    text === "Menipis";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] ${
        positive
          ? "border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-300/80"
          : warning
            ? "border-amber-400/10 bg-amber-400/[0.05] text-amber-300/80"
            : "border-blue-400/10 bg-blue-400/[0.05] text-blue-300/80"
      }`}
    >
      {text}
    </span>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[8px] uppercase tracking-[0.13em] text-white/20">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function formatHistoryDate(timestamp: string) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ProductRow({ product }: { product: ProductRecord }) {
  const status = !product.track_stock
    ? "Tidak dilacak"
    : product.stock <= 0
      ? "Habis"
      : product.stock <= product.low_stock_threshold
        ? "Menipis"
        : "Aman";

  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] p-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-xs text-white/30">
          ▣
        </div>

        <div>
          <p className="text-[11px] font-semibold">{product.name}</p>

          <p className="mt-1 text-[9px] text-white/20">
            {product.brand && product.brand !== "-"
              ? `${product.brand} · ${product.category}`
              : product.category}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold">
          {product.track_stock ? product.stock : "—"}{" "}
          {product.track_stock && (
            <span className="text-[9px] font-normal text-white/20">
              {product.unit}
            </span>
          )}
        </p>

        <p
          className={`mt-1 text-[8px] font-semibold ${
            status === "Aman"
              ? "text-emerald-300/60"
              : status === "Tidak dilacak"
                ? "text-white/30"
                : status === "Menipis"
                  ? "text-amber-300/70"
                  : "text-red-300/70"
          }`}
        >
          {status}
        </p>
      </div>
    </div>
  );
}
