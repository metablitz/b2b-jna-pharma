"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminPromotions,
  togglePromotion,
  deletePromotion,
  createPromotion,
  fetchAdminProducts,
  type AdminPromotion,
  type AdminProduct,
  type PromotionPayload,
} from "@/lib/api/admin";

const TYPE_LABEL: Record<string, string> = {
  buy_get_free: "Mua tặng",
  flash_sale: "Flash Sale",
  discount: "Giảm giá",
  bundle: "Combo",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

const BLANK_FORM: PromotionPayload = {
  type: "buy_get_free",
  manufacturerName: "",
  title: "",
  totalSaving: 0,
  minOrderQuantity: 1,
  startDate: new Date().toISOString().substring(0, 10),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
  buyProducts: [{ productId: "", quantity: 1, price: 0, isFree: false }],
  giveProducts: [{ productId: "", quantity: 1, price: 0, isFree: true }],
};

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<AdminPromotion[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PromotionPayload>(BLANK_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [p, pr] = await Promise.all([fetchAdminPromotions(), fetchAdminProducts()]);
      setPromos(p);
      setProducts(pr);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggle(id: string) {
    await togglePromotion(id);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Xóa khuyến mãi này?")) return;
    await deletePromotion(id);
    await load();
  }

  async function save() {
    setSaving(true);
    try {
      await createPromotion({ ...form, startDate: form.startDate + "T00:00:00Z", endDate: form.endDate + "T23:59:59Z" });
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  function updateBuy(i: number, key: keyof typeof form.buyProducts[number], val: string | number) {
    setForm((f) => ({ ...f, buyProducts: f.buyProducts.map((p, idx) => idx === i ? { ...p, [key]: val } : p) }));
  }

  function updateGive(i: number, key: keyof typeof form.giveProducts[number], val: string | number) {
    setForm((f) => ({ ...f, giveProducts: f.giveProducts.map((p, idx) => idx === i ? { ...p, [key]: val } : p) }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">🏷️ Quản lý khuyến mãi</h1>
        <button onClick={() => { setForm(BLANK_FORM); setShowForm(true); }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
          + Tạo khuyến mãi
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Đang tải...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {promos.map((promo) => (
            <div key={promo.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                      promo.type === "flash_sale" ? "bg-flash-orange" : "bg-promo-purple"}`}>
                      {TYPE_LABEL[promo.type] ?? promo.type}
                    </span>
                    <span className={`text-xs ${promo.isActive ? "text-primary" : "text-text-secondary"}`}>
                      {promo.isActive ? "● Đang hoạt động" : "● Tạm dừng"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-primary">{promo.title}</p>
                  <p className="text-xs text-text-secondary">
                    {promo.manufacturerName} · {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                  </p>
                  <div className="mt-1 text-xs text-text-secondary">
                    {promo.buyProducts.map((bp, i) => (
                      <span key={i}>Mua {bp.quantity} {bp.product.name} </span>
                    ))}
                    {promo.giveProducts.length > 0 && (
                      <span>· Tặng {promo.giveProducts.map((gp) => `${gp.quantity} ${gp.product.name}`).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => toggle(promo.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${promo.isActive
                      ? "border border-zinc-200 text-text-secondary" : "bg-primary text-white"}`}>
                    {promo.isActive ? "Tạm dừng" : "Bật"}
                  </button>
                  <button onClick={() => remove(promo.id)} className="text-xs text-error">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-base font-bold">Tạo khuyến mãi mới</h2>
            <div className="flex flex-col gap-3 text-sm">
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-primary">
                <option value="buy_get_free">Mua tặng</option>
                <option value="flash_sale">Flash Sale</option>
              </select>
              {(["title", "manufacturerName"] as const).map((key) => (
                <input key={key} placeholder={key} value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-primary"
                />
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-text-secondary">Bắt đầu</label>
                  <input type="date" value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="mt-0.5 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary">Kết thúc</label>
                  <input type="date" value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="mt-0.5 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm outline-none"
                  />
                </div>
              </div>

              <p className="text-xs font-medium text-text-secondary">Sản phẩm cần mua</p>
              {form.buyProducts.map((bp, i) => (
                <div key={i} className="flex gap-2">
                  <select value={bp.productId} onChange={(e) => updateBuy(i, "productId", e.target.value)}
                    className="flex-1 rounded border border-zinc-200 px-2 py-1 text-xs">
                    <option value="">Chọn sản phẩm</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" placeholder="SL" value={bp.quantity}
                    onChange={(e) => updateBuy(i, "quantity", Number(e.target.value))}
                    className="w-16 rounded border border-zinc-200 px-2 py-1 text-xs"
                  />
                  <input type="number" placeholder="Giá" value={bp.price}
                    onChange={(e) => updateBuy(i, "price", Number(e.target.value))}
                    className="w-24 rounded border border-zinc-200 px-2 py-1 text-xs"
                  />
                </div>
              ))}

              {form.type === "buy_get_free" && (
                <>
                  <p className="text-xs font-medium text-text-secondary">Sản phẩm tặng miễn phí</p>
                  {form.giveProducts.map((gp, i) => (
                    <div key={i} className="flex gap-2">
                      <select value={gp.productId} onChange={(e) => updateGive(i, "productId", e.target.value)}
                        className="flex-1 rounded border border-zinc-200 px-2 py-1 text-xs">
                        <option value="">Chọn sản phẩm</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" placeholder="SL" value={gp.quantity}
                        onChange={(e) => updateGive(i, "quantity", Number(e.target.value))}
                        className="w-16 rounded border border-zinc-200 px-2 py-1 text-xs"
                      />
                    </div>
                  ))}
                </>
              )}

              <input type="number" placeholder="Tiết kiệm (VND)" value={form.totalSaving}
                onChange={(e) => setForm((f) => ({ ...f, totalSaving: Number(e.target.value) }))}
                className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:border-primary"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-text-secondary">Hủy</button>
              <button onClick={save} disabled={saving} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? "Đang lưu..." : "Tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
