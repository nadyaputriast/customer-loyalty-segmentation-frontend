"use client";

import { useRouter } from "next/navigation";
import { useState, SubmitEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import { useAuth } from "@/hooks/use-auth";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const { isRegister, loading, error, clearError } = useAuth();

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const passwordConfirmation = String(formData.get("password_confirmation") || "").trim();

    try {
      await isRegister(name, email, password, passwordConfirmation);
    } catch (err) {
      console.error("Registration error:", err);
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
          <CardTitle className="mx-auto">Register new account</CardTitle>
          <CardDescription className="mx-auto">
            Enter your details below to create your account
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
              <Field>
                <FieldLabel htmlFor="name" className="flex items-center gap-0.5">
                  <span>Name</span>
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                />
              </Field>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password_confirmation" className="flex items-center gap-0.5">
                    <span>Password Confirmation</span>
                    <span className="text-red-500">*</span>
                  </FieldLabel>
                </div>
                <div className="relative w-full">
                  <Input 
                    id="password_confirmation" 
                    name="password_confirmation" 
                    type={showPasswordConfirmation ? "text" : "password"} 
                    placeholder="Confirm your password"
                    required 
                  />
                  <button 
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  >
                    <Eye className={`h-4 w-4 ${showPasswordConfirmation ? 'hidden' : 'block'}`} />
                    <EyeOff className={`h-4 w-4 ${showPasswordConfirmation ? 'block' : 'hidden'}`} />
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
                  <span>Register</span>
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary underline">
                    Login here
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
