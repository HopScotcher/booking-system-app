"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon } from "lucide-react";
import { EyeOff } from "lucide-react";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    setLoading(false);
    console.log(res)

    if (res?.error) {
      // Show more detailed error messages during development
      setError(
        process.env.NODE_ENV === "development" 
          ? res.error
          : res.error === "CredentialsSignin"
            ? "Invalid email or password"
            : "Authentication failed"
      );
    } else if (res?.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg"
      >
        <div className="mb-6 text-center">
          {/* <img
            src="/logo.svg"
            alt="Company Logo"
            className="mx-auto h-12 w-12"
          /> */}
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Business Login
          </h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              className={`mt-1 w-full rounded border px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"}`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform"
            >
              {showPassword ? (
                <EyeIcon/>
              ) : (
                <EyeOff/>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        {error && (
          <div className="rounded bg-red-100 p-2 text-center text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
