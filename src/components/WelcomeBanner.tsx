"use client";

import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/constants";

export default function WelcomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = localStorage.getItem("jna_show_welcome");
    if (flag === "1") {
      setShow(true);
      localStorage.removeItem("jna_show_welcome");
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <div className="mb-2 text-4xl">🎉</div>
          <h2 className="text-lg font-bold text-text-primary">
            Chào mừng đến với {COMPANY.brandName}!
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Tài khoản nhà thuốc của bạn đã được tạo thành công.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl bg-accent p-3 text-sm">
          <p className="font-medium text-text-primary">Bước tiếp theo:</p>
          <ul className="flex flex-col gap-1.5 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              Nhân viên {COMPANY.brandName} sẽ xem xét hồ sơ và kích hoạt tài khoản trong <strong>1–2 ngày làm việc</strong>.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              Sau khi được duyệt, bạn có thể đặt hàng với hạn mức công nợ{" "}
              <strong>3.000.000đ</strong> mặc định.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              Liên hệ hotline{" "}
              <a href={`tel:${COMPANY.hotlineTel}`} className="font-medium text-primary">
                {COMPANY.hotline}
              </a>{" "}
              nếu cần hỗ trợ.
            </li>
          </ul>
        </div>

        <button
          onClick={() => setShow(false)}
          className="rounded-lg bg-primary py-2.5 text-sm font-medium text-white"
        >
          Bắt đầu khám phá sản phẩm
        </button>
      </div>
    </div>
  );
}
