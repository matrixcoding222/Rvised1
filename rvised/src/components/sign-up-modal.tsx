"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Chrome, Mail } from "lucide-react"

interface SignUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEmailSignUp: () => void
}

export function SignUpModal({ open, onOpenChange, onEmailSignUp }: SignUpModalProps) {
  const handleEmailSignUp = () => {
    onOpenChange(false)
    onEmailSignUp()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono font-semibold text-center">Get started</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2 animate-in slide-in-from-bottom-2 duration-300 delay-100">
            <p className="text-muted-foreground">
              Transform your YouTube learning experience with intelligent summaries and active learning tools.
            </p>
          </div>

          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 delay-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span>Chrome extension included</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span>Personal knowledge library</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span>Start learning immediately</span>
              </div>
            </div>

            <div className="text-center">
              <a href="#" className="text-sm text-primary hover:underline transition-colors">
                Learn more about free trial
              </a>
            </div>
          </div>

          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300 delay-300">
            <p className="text-sm font-medium text-center">Sign up to your account to continue</p>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-11 justify-start gap-3 bg-[#1a73e8] text-white border-[#1a73e8] hover:bg-[#1557b0] transition-colors"
              >
                <Chrome className="h-4 w-4" />
                Sign up with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 justify-start gap-3 bg-[#0078d4] text-white border-[#0078d4] hover:bg-[#106ebe] transition-colors"
              >
                <div className="h-4 w-4 bg-white rounded-sm flex items-center justify-center">
                  <div className="text-[#0078d4] text-xs font-bold">M</div>
                </div>
                Sign up with Microsoft
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 justify-start gap-3 bg-transparent hover:bg-muted transition-colors"
                onClick={handleEmailSignUp}
              >
                <Mail className="h-4 w-4" />
                Sign up with Email
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button className="text-primary hover:underline font-medium transition-colors">Login</button>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
