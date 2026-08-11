'use server';

import { login as simpleLogin } from '@/lib/auth-simple';

export async function authenticate(
  prevState: string | null | undefined,
  formData: FormData,
): Promise<string | null> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return 'Por favor ingrese email y contraseña.';
  }

  const user = simpleLogin(email, password);
  if (!user) {
    return 'Credenciales inválidas.';
  }

  // Return null to signal success (login-form checks for null)
  return null;
}
