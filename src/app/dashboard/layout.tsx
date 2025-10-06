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
    <div>
      { children }
    </div>
  );
}