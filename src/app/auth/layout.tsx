
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="md:flex">
        <aside className="md:w-72 md:h-screen bg-white">
        </aside>

        <main className="md:flex-1 md:h-screen md:overflow-y-scroll p-5">
          {children}
        </main>
      </div>
    </>
  );
}
