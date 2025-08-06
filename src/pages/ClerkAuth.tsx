import { SignIn, SignUp } from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClerkAuth() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Welcome to MoneyBees
            </CardTitle>
            <CardDescription>
              Your smart expense tracking companion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <SignIn 
                  routing="hash"
                  signUpUrl="#signup"
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-primary hover:bg-primary/90",
                      card: "bg-transparent shadow-none",
                    }
                  }}
                />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <SignUp 
                  routing="hash"
                  signInUrl="#signin"
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-primary hover:bg-primary/90",
                      card: "bg-transparent shadow-none",
                    }
                  }}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm text-foreground mb-2">
                🐝 What you'll get:
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Smart expense tracking with AI</li>
                <li>• Beautiful analytics and insights</li>
                <li>• Budget management tools</li>
                <li>• Receipt scanning capabilities</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}