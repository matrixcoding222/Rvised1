import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Custom header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/glasses.svg" 
              alt="Rvised" 
              width={40} 
              height={40} 
              className="h-10 w-10"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Rvised Today</h1>
          <p className="text-gray-600">Start transforming videos into actionable knowledge</p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl rounded-xl",
              headerTitle: "hidden", // Hide Clerk's default title
              headerSubtitle: "hidden", // Hide Clerk's default subtitle
              socialButtonsProviderIcon__google: "w-5 h-5",
              socialButtonsBlockButton: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all",
              socialButtonsBlockButtonText: "font-semibold text-white",
              formButtonPrimary: "hidden", // Hide email sign up
              footerActionLink: "hidden", // Hide footer links
              formFieldLabel: "hidden", // Hide form fields
              formFieldInput: "hidden", // Hide form inputs
              dividerLine: "hidden", // Hide divider
              dividerText: "hidden", // Hide divider text
              form: "hidden", // Hide the entire email form
              footer: "hidden", // Hide footer
            },
            layout: {
              socialButtonsPlacement: 'top', // Show social buttons (Google) at the top
              socialButtonsVariant: 'blockButton', // Make them prominent
              showOptionalFields: false, // Hide optional fields
            }
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />
      </div>
    </div>
  )
}