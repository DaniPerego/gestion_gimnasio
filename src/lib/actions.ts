'use server';

import { login as simpleLogin } from '@/lib/auth-simple';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return 'Por favor ingrese email y contraseña.';
  }

  const user = simpleLogin(email, password);
  if (!user) {
    return 'Credenciales inválidas.';
  }

  // In a real app we'd use cookies/jwt, for demo we redirect
  // The middleware will check localStorage on the client side
  return undefined;
}
