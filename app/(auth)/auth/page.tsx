"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import AuthForm from "@/components/forms/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function AuthFormSkeleton() {
  return (
    <Card className="shadow-lg py-6">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
        </CardTitle>
        <CardDescription className="text-center">
          <Skeleton className="h-4 w-64 mx-auto mt-2" />
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Email field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Password field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Remember me / Forgot password skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Submit button skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth buttons skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>

      <CardFooter className="flex justify-center pt-4">
        <Skeleton className="h-4 w-56" />
      </CardFooter>
    </Card>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Kyzat</h1>
          <p className="text-muted-foreground">
            Sign in or create your account
          </p>
        </div>

        <Suspense fallback={<AuthFormSkeleton />}>
          <AuthForm />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
