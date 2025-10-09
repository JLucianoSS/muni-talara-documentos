import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // puedes elegir los pesos que necesites
});

export const metadata: Metadata = {
  title: "Sistema de gestión",
  description: "Gestión de documentos para la municipalidad de Talara",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {

  return (
    <html lang="es">
      <body className={roboto.className}>
        {children}
      </body>
    </html>
  );
}
