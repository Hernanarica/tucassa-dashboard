import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  signInAuthErrorMessage,
  signInFieldErrors,
  signInSchema,
  type SignInFieldErrors,
  type SignInValues,
} from '@/lib/validations/sign-in'

export function SignIn() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({})
  const [authError, setAuthError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function validateField(field: keyof SignInValues, value: string) {
    const result = signInSchema.shape[field].safeParse(value)

    setFieldErrors((current) => ({
      ...current,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }))
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    setAuthError(null)
    if (fieldErrors.email) {
      validateField('email', value)
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    setAuthError(null)
    if (fieldErrors.password) {
      validateField('password', value)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError(null)

    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      setFieldErrors(signInFieldErrors(result.error))
      return
    }

    setFieldErrors({})
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword(result.data)
    setLoading(false)

    if (signInError) {
      setAuthError(signInAuthErrorMessage(signInError.message))
      return
    }

    void navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Ingresá con tu email y contraseña para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Field label="Email" htmlFor="email" error={fieldErrors.email}>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                onBlur={() => validateField('email', email)}
              />
            </Field>
            <Field label="Contraseña" htmlFor="password" error={fieldErrors.password}>
              <PasswordInput
                autoComplete="current-password"
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                onBlur={() => validateField('password', password)}
              />
            </Field>
            {authError ? (
              <p className="text-sm text-destructive" role="alert">
                {authError}
              </p>
            ) : null}
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
