import { redirect } from 'react-router'
import { supabase } from '@/lib/supabase'

export async function requireAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw redirect('/signin')
  }

  return session
}

export async function requireGuest() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    throw redirect('/')
  }

  return null
}
