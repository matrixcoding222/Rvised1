import { redirect } from 'next/navigation'

export default function SignIn() {
  // Redirect to Clerk's sign-in page
  redirect('/sign-in')
}
