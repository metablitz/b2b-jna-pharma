"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchImportLogs,
  type AdminProduct,
  type ProductPayload,
  type ImportLog,
} from "@/lib/api/admin";
import ImportWizard from "@/components/admin/ImportWizard";

const BLANK: ProductPayload = {
  name: "",
  sku: "",
  category: "",
  manufacturer: "",
  unit: "",
  packagingInfo: "",
  basePrice: 0,
  currentPrice: 0,
  isVAT: true,
  stockQuantity: 0,
  isLimitedStock: false,
  isFeatured: false,
  isActive: true,
  tierPricing: [],
};

function formatPrice(v: number) {
  return `${v.toLocaleString("vi-VN")}đ`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ProductPayload>(BLANK);
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  async function load(q?: string) {
    setLoading(true);
    try {
      setProducts(await fetchAdminProducts(q));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm(BLANK);
    setEditing(null);
    setAdding(true);
  }

  function openEdit(p: AdminProduct) {
    setForm({
      name: p.name, sku: p.sku, category: p.category, manufacturer: p.manufacturer,
      unit: p.unit, packagingInfo: p.packagingInfo, basePrice: p.basePrice,
      currentPrice: p.currentPrice, previousPrice: p.previousPrice ?? undefined,
      priceChangePercent: p.priceChangePercent ?? undefined,
      isVAT: p.isVAT, stockQuantity: p.stockQuantity, isLimitedStock: p.isLimitedStock,
      isFeatured: p.isFeatured, isActive: p.isActive,
      expiryDate: p.expiryDate ? p.expiryDate.substring(0, 10) : null,
      tierPricing: p.tierPricing.map(({ minQuantity, price }) => ({ minQuantity, price })),
    });
    setEditing(p);
    setAdding(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) await updateAdminProduct(editing.id, form);
      else await createAdminProduct(form);
      setAdding(false);
      await load(search);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Xóa sản phẩm này?")) return;
    await deleteAdminProduct(id);
    await load(search);
  }

  function addTier() {
    setForm((f) => ({ ...f, tierPricing: [...f.tierPricing, { minQuantity: 1, price: 0 }] }));
  }

  function removeTier(i: number) {
    setForm((f) => ({ ...f, tierPricing: f.tierPricing.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">💊 Quản lý sản phẩm</h1>
        <div className="flex gap-2">
          <button
            onClick={async () => { setShowLogs(true); setLogs(await fetchImportLogs()); }}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-text-secondary"
          >
            📋 Lịch sử
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            📥 Import Excel
          </button>
          <button onClick={openAdd} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary">
            + Thêm thủ công
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          placeholder="Tìm theo tên hoặc SKU..."
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button onClick={() => load(search)} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-text-secondary">
          Tìm
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-text-secondary">
              <tr>
                <th className="p-3 text-left">SKU</th>
                <th className="p-3 text-left">Tên sản phẩm</th>
                <th className="p-3 text-left">Danh mục</th>
                <th className="p-3 text-right">Giá</th>
                <th className="p-3 text-center">Tồn</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100">
                  <td className="p-3 text-text-secondary">{p.sku}</td>
                  <td className="p-3 font-medium text-text-primary">{p.name}</td>
                  <td className="p-3 text-text-secondary">{p.category}</td>
                  <td className="p-3 text-right text-price">{formatPrice(p.currentPrice)}</td>
                  <td className="p-3 text-center">{p.stockQuantity}</td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? "bg-accent text-primary" : "bg-zinc-100 text-text-secondary"}`}>
                      {p.isActive ? "Đang bán" : "Ẩn"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-primary">Sửa</button>
                      <button onClick={() => remove(p.id)} className="text-xs text-error">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-base font-bold">{editing ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
            <div className="flex flex-col gap-3">
              {(["name", "sku", "category", "manufacturer", "unit", "packagingInfo"] as const).map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium capitalize text-text-secondary">{key}</label>
                  <input
                    value={(form[key] as string) ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {(["basePrice", "currentPrice", "stockQuantity"] as const).map((key) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-text-secondary">{key}</label>
                    <input type="number" value={form[key] ?? 0}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-text-secondary">Hạn dùng (YYYY-MM-DD)</label>
                  <input type="date" value={form.expiryDate ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value || null }))}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                {(["isVAT", "isLimitedStock", "isFeatured", "isActive"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-1.5">
                    <input type="checkbox" checked={!!form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                    />
                    {key}
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">Giá theo số lượng</span>
                  <button onClick={addTier} className="text-xs text-primary">+ Thêm</button>
                </div>
                {form.tierPricing.map((tier, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="number" placeholder="Số lượng" value={tier.minQuantity}
                      onChange={(e) => setForm((f) => ({
                        ...f, tierPricing: f.tierPricing.map((t, idx) => idx === i ? { ...t, minQuantity: Number(e.target.value) } : t)
                      }))}
                      className="flex-1 rounded border border-zinc-200 px-2 py-1 text-xs"
                    />
                    <input type="number" placeholder="Giá" value={tier.price}
                      onChange={(e) => setForm((f) => ({
                        ...f, tierPricing: f.tierPricing.map((t, idx) => idx === i ? { ...t, price: Number(e.target.value) } : t)
                      }))}
                      className="flex-1 rounded border border-zinc-200 px-2 py-1 text-xs"
                    />
                    <button onClick={() => removeTier(i)} className="text-xs text-error">×</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setAdding(false)} className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-text-secondary">
                Hủy
              </button>
              <button onClick={save} disabled={saving} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Wizard Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h2 className="text-base font-bold">📥 Import sản phẩm từ Excel</h2>
              <button onClick={() => setShowImport(false)} className="text-text-secondary">✕</button>
            </div>
            <div className="p-5">
              <ImportWizard
                onDone={() => {
                  setShowImport(false);
                  load(search);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Import Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <h2 className="text-base font-bold">📋 Lịch sử Import</h2>
              <button onClick={() => setShowLogs(false)} className="text-text-secondary">✕</button>
            </div>
            <div className="overflow-x-auto p-4">
              {logs.length === 0 ? (
                <p className="text-center text-sm text-text-secondary py-8">Chưa có lần import nào.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-xs text-text-secondary">
                    <tr>
                      <th className="p-2 text-left">Thời gian</th>
                      <th className="p-2 text-left">File</th>
                      <th className="p-2 text-center">Tổng</th>
                      <th className="p-2 text-center">Tạo</th>
                      <th className="p-2 text-center">Cập nhật</th>
                      <th className="p-2 text-center">Ẩn</th>
                      <th className="p-2 text-center">Bỏ qua</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-zinc-100">
                        <td className="p-2 text-xs text-text-secondary">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="p-2 text-xs text-text-primary max-w-xs truncate">{log.fileName}</td>
                        <td className="p-2 text-center">{log.totalRows}</td>
                        <td className="p-2 text-center text-primary">{log.created}</td>
                        <td className="p-2 text-center text-price-orange">{log.updated}</td>
                        <td className="p-2 text-center text-error">{log.deactivated}</td>
                        <td className="p-2 text-center text-text-secondary">{log.skipped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
