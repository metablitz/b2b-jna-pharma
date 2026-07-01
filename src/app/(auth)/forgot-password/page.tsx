import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl">
          🔑
        </div>
        <h1 className="text-xl font-bold text-text-primary">Quên mật khẩu?</h1>
        <p className="text-sm text-text-secondary">
          Nhập số điện thoại để xác thực qua thiết bị đã đăng nhập
        </p>
      </div>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-medium text-text-primary">
            Số điện thoại
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Nhập số điện thoại"
            className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium uppercase text-white"
        >
          Tiếp tục
        </button>
      </form>

      <div className="rounded-lg bg-accent p-3 text-xs text-text-secondary">
        Bạn cần xác thực qua thiết bị đã đăng nhập trước đó để đặt lại mật khẩu
      </div>

      <Link href="/login" className="text-center text-sm font-medium text-primary">
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
