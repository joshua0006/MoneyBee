import { SignIn, SignUp } from '@clerk/clerk-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import moneyBeesLogo from '@/assets/moneybees-logo.png'

export default function Auth() {
  const [activeTab, setActiveTab] = useState('sign-in')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bee-amber/5 to-bee-blue/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 p-3 gradient-gold rounded-full shadow-gold">
            <img 
              src={moneyBeesLogo} 
              alt="MoneyBees" 
              className="w-8 h-8"
            />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-bee-blue to-bee-gold bg-clip-text text-transparent">
            Welcome to MoneyBees
          </h1>
          <p className="text-muted-foreground">
            Your smart financial companion
          </p>
        </div>

        {/* Auth Forms */}
        <Card className="glass-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Get Started</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sign-in" className="mt-6">
                <div className="flex justify-center">
                  <SignIn 
                    appearance={{
                      elements: {
                        formButtonPrimary: 'gradient-blue bee-button',
                        card: 'shadow-none border-0 bg-transparent',
                        headerTitle: 'text-foreground',
                        headerSubtitle: 'text-muted-foreground',
                        socialButtonsBlockButton: 'border-border hover:bg-muted',
                        formFieldInput: 'border-border focus:ring-bee-blue',
                        footerActionLink: 'text-bee-blue hover:text-bee-blue/80'
                      }
                    }}
                    fallbackRedirectUrl="/"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="sign-up" className="mt-6">
                <div className="flex justify-center">
                  <SignUp 
                    appearance={{
                      elements: {
                        formButtonPrimary: 'gradient-blue bee-button',
                        card: 'shadow-none border-0 bg-transparent',
                        headerTitle: 'text-foreground',
                        headerSubtitle: 'text-muted-foreground',
                        socialButtonsBlockButton: 'border-border hover:bg-muted',
                        formFieldInput: 'border-border focus:ring-bee-blue',
                        footerActionLink: 'text-bee-blue hover:text-bee-blue/80'
                      }
                    }}
                    fallbackRedirectUrl="/"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="text-center space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">What you'll get:</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-bee-gold"></div>
              Smart expense tracking
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-bee-blue"></div>
              Receipt scanning
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-income"></div>
              Budget management
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-expense"></div>
              Analytics & insights
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}