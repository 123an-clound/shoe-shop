"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signInAdmin } from "@/lib/actions/auth";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const result = await signInAdmin(values.email, values.password);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Mật khẩu"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          {serverError}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
