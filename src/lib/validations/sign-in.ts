import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email('Ingresá un email válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

export type SignInValues = z.infer<typeof signInSchema>

export type SignInFieldErrors = {
  email?: string
  password?: string
}

export function signInFieldErrors(error: z.ZodError<SignInValues>): SignInFieldErrors {
  const { fieldErrors } = z.flattenError(error)

  return {
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
  }
}

export function signInAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Confirmá tu email antes de ingresar'
  }

  return 'No se pudo iniciar sesión. Intentá de nuevo.'
}
