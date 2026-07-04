export default function AdminPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-app-bg px-4 py-8">
      {children}
    </div>
  );
}
