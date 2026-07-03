"use client";

import { useRef, useState } from "react";
import {
  previewImport,
  executeImport,
  type ImportPreviewResult,
  type MissingProduct,
} from "@/lib/api/admin";

type WizardStep = "idle" | "uploading" | "preview" | "categories" | "missing" | "executing" | "done";

type MissingAction = { productId: string; action: "deactivate" | "keep"; reason?: string };

function formatPrice(v: number) {
  return `${v.toLocaleString("vi-VN")}đ`;
}

export default function ImportWizard({ onDone }: { onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<WizardStep>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string>>({});
  const [missingActions, setMissingActions] = useState<Record<string, MissingAction>>({});
  const [result, setResult] = useState<{ created: number; updated: number; deactivated: number; kept: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(f: File) {
    setFile(f);
    setError(null);
    setStep("uploading");
    try {
      const data = await previewImport(f);
      setPreview(data);
      // Initialize category edits with existing mappings
      const edits: Record<string, string> = { ...data.existingCategoryMappings };
      for (const raw of data.newRawCategories) {
        if (!edits[raw]) {
          // Auto-suggest: strip "NHOM " prefix, title case
          edits[raw] = raw.replace(/^NHOM\s+/i, "").trim();
        }
      }
      setCategoryEdits(edits);
      // Initialize missing actions (default: deactivate)
      const actions: Record<string, MissingAction> = {};
      for (const p of data.missingProducts) {
        actions[p.id] = { productId: p.id, action: "deactivate" };
      }
      setMissingActions(actions);

      if (data.newRawCategories.length > 0) {
        setStep("categories");
      } else if (data.missingProducts.length > 0) {
        setStep("missing");
      } else {
        setStep("preview");
      }
    } catch (e) {
      setError(String(e));
      setStep("idle");
    }
  }

  async function handleExecute() {
    if (!file || !preview) return;
    setStep("executing");
    setError(null);
    try {
      const catMappings = Object.entries(categoryEdits).map(([rawName, displayName]) => ({
        rawName,
        displayName,
      }));
      const res = await executeImport(file, {
        categoryMappings: catMappings,
        missingActions: Object.values(missingActions),
      });
      setResult(res);
      setStep("done");
    } catch (e) {
      setError(String(e));
      setStep("preview");
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (step === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <span className="text-4xl">📥</span>
        <p className="text-sm font-medium text-text-primary">Upload file xuất từ phần mềm nội bộ</p>
        <p className="text-xs text-text-secondary">Hỗ trợ .xlsx và .csv (File 1 — đầy đủ 31 cột)</p>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white"
        >
          Chọn file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <span className="text-3xl">⏳</span>
        <p className="text-sm text-text-secondary">Đang phân tích file {file?.name}...</p>
      </div>
    );
  }

  if (step === "categories" && preview) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold">Bước 1: Xác nhận tên danh mục</h3>
          <p className="text-xs text-text-secondary mt-1">
            Phát hiện {preview.newRawCategories.length} danh mục mới. Điền tên tiếng Việt đầy đủ:
          </p>
        </div>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          {preview.newRawCategories.map((raw) => (
            <div key={raw} className="flex items-center gap-3">
              <span className="text-xs text-text-secondary w-48 shrink-0 font-mono">{raw}</span>
              <span className="text-text-secondary">→</span>
              <input
                value={categoryEdits[raw] ?? ""}
                onChange={(e) => setCategoryEdits((p) => ({ ...p, [raw]: e.target.value }))}
                placeholder="VD: Kháng viêm"
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => setStep("idle")} className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-text-secondary">Hủy</button>
          <button
            onClick={() => {
              if (preview.missingProducts.length > 0) setStep("missing");
              else setStep("preview");
            }}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white"
          >
            Tiếp theo →
          </button>
        </div>
      </div>
    );
  }

  if (step === "missing" && preview && preview.missingProducts.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold">Bước 2: Sản phẩm không còn trong file</h3>
          <p className="text-xs text-text-secondary mt-1">
            {preview.missingProducts.length} sản phẩm đang có trên website nhưng không xuất hiện trong file mới. Xử lý:
          </p>
        </div>
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {preview.missingProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-lg border border-zinc-100 p-2.5">
              <span className="flex-1 text-xs text-text-primary">{p.name}</span>
              <select
                value={missingActions[p.id]?.action ?? "deactivate"}
                onChange={(e) =>
                  setMissingActions((prev) => ({
                    ...prev,
                    [p.id]: { productId: p.id, action: e.target.value as "deactivate" | "keep" },
                  }))
                }
                className="rounded border border-zinc-200 px-2 py-1 text-xs"
              >
                <option value="deactivate">Tạm ẩn</option>
                <option value="keep">Giữ nguyên (hàng đang về)</option>
              </select>
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setStep(preview.newRawCategories.length > 0 ? "categories" : "idle")}
            className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-text-secondary"
          >
            Quay lại
          </button>
          <button onClick={() => setStep("preview")} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white">
            Tiếp theo →
          </button>
        </div>
      </div>
    );
  }

  if (step === "preview" && preview) {
    const deactivateCount = Object.values(missingActions).filter((a) => a.action === "deactivate").length;
    const keepCount = Object.values(missingActions).filter((a) => a.action === "keep").length;

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold">Xác nhận Import</h3>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon="✅" label="Tạo mới" value={preview.toCreate.length} color="text-primary" />
          <Stat icon="🔄" label="Cập nhật giá" value={preview.toUpdate.length} color="text-price-orange" />
          <Stat icon="⚠️" label="Tạm ẩn" value={deactivateCount} color="text-error" />
          <Stat icon="📌" label="Giữ nguyên" value={keepCount} color="text-text-secondary" />
          {preview.errors.length > 0 && (
            <Stat icon="❌" label="Bỏ qua" value={preview.errors.length} color="text-error" />
          )}
        </div>

        {preview.errors.length > 0 && (
          <details className="rounded-lg border border-zinc-100 p-3">
            <summary className="cursor-pointer text-xs font-medium text-text-secondary">
              Xem {preview.errors.length} dòng lỗi ▼
            </summary>
            <div className="mt-2 flex flex-col gap-1 max-h-32 overflow-y-auto">
              {preview.errors.slice(0, 20).map((e, i) => (
                <p key={i} className="text-[11px] text-error">
                  Dòng {e.rowIndex}: {e.reason} {e.name ? `(${e.name})` : ""}
                </p>
              ))}
            </div>
          </details>
        )}

        <div className="rounded-lg bg-accent p-3 text-xs text-text-secondary">
          ⚠️ Thao tác này sẽ cập nhật <strong>{preview.toUpdate.length}</strong> sản phẩm và
          tạo <strong>{preview.toCreate.length}</strong> sản phẩm mới. Không thể hoàn tác.
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex gap-3">
          <button onClick={() => setStep("idle")} className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm text-text-secondary">Hủy</button>
          <button
            onClick={handleExecute}
            className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white"
          >
            ✅ Xác nhận Import
          </button>
        </div>
      </div>
    );
  }

  if (step === "executing") {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <span className="text-3xl">⏳</span>
        <p className="text-sm text-text-secondary">Đang import... vui lòng không đóng trang</p>
      </div>
    );
  }

  if (step === "done" && result) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🎉</span>
          <h3 className="text-base font-bold text-text-primary">Import thành công!</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon="✅" label="Đã tạo mới" value={result.created} color="text-primary" />
          <Stat icon="🔄" label="Đã cập nhật" value={result.updated} color="text-price-orange" />
          <Stat icon="⚠️" label="Đã ẩn" value={result.deactivated} color="text-error" />
          <Stat icon="📌" label="Giữ nguyên" value={result.kept} color="text-text-secondary" />
          {result.skipped > 0 && (
            <Stat icon="❌" label="Bỏ qua" value={result.skipped} color="text-error" />
          )}
        </div>
        <button
          onClick={() => { onDone(); setStep("idle"); setPreview(null); setResult(null); setFile(null); }}
          className="rounded-lg bg-primary py-2.5 text-sm font-medium text-white"
        >
          Hoàn tất
        </button>
      </div>
    );
  }

  return null;
}

function Stat({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3">
      <span>{icon}</span>
      <div>
        <p className={`text-lg font-bold ${color}`}>{value.toLocaleString()}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}
