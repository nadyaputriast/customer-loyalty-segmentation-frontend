import { SegmentsProvider } from "@/contexts/segments-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SegmentsProvider>
      {children}
    </SegmentsProvider>
  );
};