"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, SubmitEvent, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const message = searchParams.get("message");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { isLogin, loading, error, clearError } = useAuth();

  useEffect(() => {
    if (!message) return;

    setFlashMessage(message);
    const t = setTimeout(() => {
      setFlashMessage(null);
      router.replace(window.location.pathname);
    }, 4000);

    return () => clearTimeout(t);
  }, [message, router]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    try {
      await isLogin(email, password);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <img
          src="/logo.svg"
          alt="LoyalT Logo"
          className="mx-auto mt-6 h-14 w-auto"
        />
        <CardHeader>
          <CardTitle className="mx-auto">Login to your account</CardTitle>
          <CardDescription className="mx-auto">
            Enter your details below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {flashMessage && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {flashMessage}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email" className="flex items-center gap-0.5">
                  <span>Email</span>
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="flex items-center gap-0.5">
                    <span>Password</span>
                    <span className="text-red-500">*</span>
                  </FieldLabel>
                </div>
                <div className="relative w-full">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password"
                    required 
                  />
                  <button 
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye className={`h-4 w-4 ${showPassword ? 'hidden' : 'block'}`} />
                    <EyeOff className={`h-4 w-4 ${showPassword ? 'block' : 'hidden'}`} />
                  </button>
                </div>
              </Field>
              <Field>
                <Button 
                  type="submit"
                  className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  <LoaderCircle className={`h-4 w-4 animate-spin ${loading ? 'block' : 'hidden'}`} />
                  <span>Login</span>
                </Button>
                <FieldDescription className="text-center">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary underline">
                    Register here
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
