'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { setSession } from '@/lib/auth';

// Esquema de validación con Zod
const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null); // Limpiar errores anteriores
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const user = await response.json();
        setSession(user); // Guarda la sesión en cookies
        router.replace('/dashboard'); // Redirige a la página del dashboard (sin poder volver atrás)
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Error en el login');
      }
    } catch (err) {
      console.error(err);
      // Mostrar el error como un mensaje en el formulario
      const errorMessage = err instanceof Error ? err.message : 'Error al conectar con el servidor';
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-muni-talara.png"
              alt="Logo Municipalidad de Talara"
              className="h-16"
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
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                {...register('username')}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF] ${
                  errors.username ? 'border-red-500' : ''
                }`}
                placeholder="admin"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0093DF] focus:border-[#0093DF] ${
                  errors.password ? 'border-red-500' : ''
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 top-6"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{loginError}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#0093DF] text-white cursor-pointer py-2 px-4 rounded-md hover:bg-[#007AC0] focus:outline-none focus:ring-2 focus:ring-[#0093DF] ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}