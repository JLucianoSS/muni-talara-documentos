
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode; }) {

  const cookieStore = await cookies();
  const session = cookieStore.get("userSession")?.value;
  console.log(session);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header/>
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 bg-muni-white">
            {children}
          </main>
        </div>
    </div>
  );
}