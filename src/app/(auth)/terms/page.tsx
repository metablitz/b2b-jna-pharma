const SECTIONS = [
  {
    title: "Chính sách kiểm hàng",
    body: "Nội dung chính sách kiểm hàng sẽ được cập nhật.",
  },
  {
    title: "Chính sách bảo mật thông tin",
    body: "Nội dung chính sách bảo mật thông tin sẽ được cập nhật.",
  },
  {
    title: "Quy trình tiếp nhận và giải quyết khiếu nại",
    body: "Nội dung quy trình giải quyết khiếu nại sẽ được cập nhật.",
  },
  {
    title: "Chính sách đổi trả",
    body: "Nội dung chính sách đổi trả sẽ được cập nhật.",
  },
  {
    title: "Chính sách vận chuyển, giao nhận",
    body: "Nội dung chính sách vận chuyển, giao nhận sẽ được cập nhật.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-text-primary">Điều khoản sử dụng</h1>
      <div className="flex flex-col divide-y divide-zinc-100">
        {SECTIONS.map((section) => (
          <details key={section.title} className="py-3">
            <summary className="cursor-pointer text-sm font-medium text-text-primary">
              {section.title}
            </summary>
            <p className="mt-2 text-sm text-text-secondary">{section.body}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
