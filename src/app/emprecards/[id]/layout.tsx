export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function IdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
