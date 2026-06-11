import { SegmentsProvider } from "@/contexts/segments-context";

export default function InferenceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SegmentsProvider>
      {children}
    </SegmentsProvider>
  );
}