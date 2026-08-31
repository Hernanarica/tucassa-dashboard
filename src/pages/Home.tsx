import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function Home() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string | null>(null)
  const [signOutError, setSignOutError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) {
        setEmail(user?.email ?? null)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSignOut() {
    setSignOutError(null)
    const { error } = await supabase.auth.signOut()

    if (error) {
      setSignOutError(error.message)
      return
    }

    void navigate('/signin', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Tucassa Dashboard</h1>
      <p className="text-sm text-muted-foreground">Sesión iniciada como {email}</p>
      <Button variant="outline" onClick={handleSignOut}>
        Cerrar sesión
      </Button>
      {signOutError && <p className="text-sm text-destructive">{signOutError}</p>}
    </div>
  )
}
