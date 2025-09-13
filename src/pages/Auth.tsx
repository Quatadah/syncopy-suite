import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { addToast, Button, Card, CardBody, CardHeader, Divider, Input, Tab, Tabs } from "@heroui/react";
import { Eye, EyeOff, Github, Loader2, Mail } from "lucide-react";
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
    title: "Sign In / Sign Up | Syncopy",
    description: "Sign in to your Syncopy account or create a new one to start syncing your clipboard across all devices. Free and secure.",
    url: "https://syncopy.app/auth",
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

  const handleMagicLink = async () => {
    if (!email) {
      addToast({
        title: "Email required",
        description: "Please enter your email address",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      })
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
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
        description: "We sent you a magic link to sign in",
        color: "success",
        variant: "solid",
        timeout: 5000,
      })
    }
  };

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
        title: "Missing fields",
        description: "Please enter your email and password",
        color: "danger",
        variant: "solid",
        timeout: 5000,
      })
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
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
        title: "Welcome back!",
        description: "You have been signed in successfully",
        color: "success",
        variant: "solid",
        timeout: 5000,
      })
      navigate('/dashboard');
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
    }
  };

  const handleGithubAuth = async () => {
    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center flex flex-col items-center">
          <h2 className="text-2xl font-bold">Welcome to Clipboard</h2>
          <p className="text-sm text-muted-foreground">
            Sign in to access your clipboard across all devices
          </p>
        </CardHeader>
        <CardBody className="w-full">
          <Tabs defaultSelectedKey="signin" className="w-full" classNames={{
            tabList: "w-full",
            tab: "flex-1 flex items-center justify-center",
            tabContent: "flex items-center justify-center",
            cursor: "w-full",
            panel: "w-full"
          }}>
            <Tab key="signin" title="Sign In" className="space-y-4 w-full">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full bg-gradient-hero text-white"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </Tab>
            <Tab key="signup" title="Sign Up" className="space-y-4 w-full">
              <div className="space-y-2">
                <Input
                  id="fullName"
                  label="Full Name (Optional)"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSignUp}
                disabled={isLoading}
                className="w-full bg-gradient-hero text-white"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Up
              </Button>
            </Tab>
          </Tabs>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Divider />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="ghost"
                onClick={handleGithubAuth}
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={handleMagicLink}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Magic Link
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Auth;