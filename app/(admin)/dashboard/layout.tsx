import { AnalyticsProvider } from "@/contexts/analytics-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
};