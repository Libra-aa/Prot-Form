import "./globals.css";

export const metadata = {
  title: "Form Builder",
  description: "Create and share forms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
