import { EmailVerificationPage } from "@/components/email-verification-page"

interface VerifyPageProps {
  searchParams: { token?: string }
}

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  return <EmailVerificationPage token={searchParams.token} />
}
