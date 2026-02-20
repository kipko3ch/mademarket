export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/60 via-background to-background dark:from-blue-950/20 dark:via-background px-4">
      {children}
    </div>
  );
}
