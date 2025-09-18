import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { addToast, Button, Card, CardBody, CardHeader, Input, Tab, Tabs } from "@heroui/react";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  // SEO optimization
  useSEO({
    title: "Sign In / Sign Up | Clippy",
    description: "Sign in to your Clippy account or create a new one to start syncing your clipboard across all devices. Free and secure.",
    url: "https://clippy.app/auth",
    noindex: true, // Auth page shouldn't be indexed
    nofollow: true
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);


  const handleSignUp = async () => {
    if (!email || !password) {
      addToast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      })
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setIsLoading(false);

    if (authError) {
      addToast({
        title: "Error",
        description: authError.message,
        color: "danger",
        variant: "solid",
        timeout: 5000,
      })
    } else {
      addToast({
        title: "Check your email",
        description: "We sent you a confirmation link",
        color: "success",
        variant: "solid",
        timeout: 5000,
      })
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      addToast({
        title: "Missing credentials",
        description: "Please enter your email and password to sign in",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (authError) {
      // Enhanced error messages for better user experience
      let errorMessage = authError.message;
      if (authError.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (authError.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      }
      
      addToast({
        title: "Sign in failed",
        description: errorMessage,
        color: "danger",
        variant: "solid",
        timeout: 5000,
      });
    } else {
      addToast({
        title: "Welcome back!",
        description: "You have been signed in successfully",
        color: "success",
        variant: "solid",
        timeout: 5000,
      });
      navigate('/dashboard');
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            <img 
              src="/src/assets/images/clippy-logo.png" 
              alt="Clippy Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Clippy</h1>
          <p className="text-muted-foreground">Sync your clipboard across all devices</p>
        </div>

        <Card className="shadow-large border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center flex flex-col items-center space-y-1 pb-4">
            <h2 className="text-2xl font-bold text-card-foreground">Get Started</h2>
            <p className="text-sm text-muted-foreground">
              Sign in or create your account
            </p>
          </CardHeader>
          <CardBody className="w-full">
            <Tabs defaultSelectedKey="signin" className="w-full p-0" classNames={{
              tabList: "w-full",
              tab: "flex-1 flex items-center justify-center",
              tabContent: "flex items-center justify-center",
              cursor: "w-full",
              panel: "w-full"
            }}>
              <Tab key="signin" title="Sign In" className="space-y-4 w-full">
                {/* Email/Password Form */}
                <div className="space-y-4">
                    <Input
                      id="signin-email"
                      type="email"
                      label="Email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      startContent={<Mail className="w-4 h-4 text-muted-foreground" />}
                    />
                  
                    <div className="relative">
                      <Input
                        id="signin-password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        startContent={<Lock className="w-4 h-4 text-muted-foreground" />}
                        endContent={
                          <Button
                            type="button"
                            variant="light"
                            size="sm"
                            className="min-w-0 w-8 h-8 p-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        }
                      />
                    </div>

                  <Button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-medium"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </div>
              </Tab>

              <Tab key="signup" title="Sign Up" className="space-y-4 w-full">
                {/* Registration Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="signup-name"
                      label="Full Name (Optional)"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      startContent={<User className="w-4 h-4 text-muted-foreground" />}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="signup-email"
                      label="Email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      startContent={<Mail className="w-4 h-4 text-muted-foreground" />}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        id="signup-password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        startContent={<Lock className="w-4 h-4 text-muted-foreground" />}
                        endContent={
                          <Button
                            type="button"
                            variant="light"
                            size="sm"
                            className="min-w-0 w-8 h-8 p-0 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSignUp}
                    disabled={isLoading}
                    className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-medium"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Auth;