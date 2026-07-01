export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-app-bg px-4 py-10">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        {children}
      </div>
    </div>
  );
}
