import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import CartSync from "@/components/cart/CartSync";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 justify-center bg-app-bg">
      <div className="flex min-h-full w-full max-w-[600px] flex-col bg-white">
        <CartSync />
        <Header />
        <main className="flex-1 overflow-y-auto p-3">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
