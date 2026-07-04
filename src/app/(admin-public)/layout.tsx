export default function AdminPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-100 p-4">
      {children}
    </div>
  );
}
