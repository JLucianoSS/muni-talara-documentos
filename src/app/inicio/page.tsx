
import { cookies } from 'next/headers';
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation';

export default async function InicioPage() {

  const cookieStore = await cookies();
  const session = cookieStore.get("userSession")?.value;

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <section className="w-full mt-[-50px] max-w-md bg-white rounded-lg p-8 flex flex-col items-center gap-6">
        <div className="w-40 h-40 relative">
          <Image
            src="/logo-muni-talara.png"
            alt="Logo Municipalidad de Talara"
            fill
            sizes="(max-width: 768px) 160px, 200px"
            className="object-contain"
          />
        </div>

        <div>
          <h2 className="text-xl text-center font-semibold text-gray-800">
            SGD Unidad de Logística
          </h2>
          <p className="text-xs text-gray-500 text-center ">
            Sistema de Gestión Documental
          </p>
        </div>

        <Link href="/login" className="w-full max-w-[250px]">
          <button className="w-full cursor-pointer bg-[#0093DF] hover:bg-[#007AC0] text-white font-medium py-2.5 rounded-lg transition">
            Ingresar
          </button>
        </Link>
      </section>
    </main>
  )
}