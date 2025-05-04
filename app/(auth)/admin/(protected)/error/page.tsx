"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    // Auto-redirect after showing error
    const timer = setTimeout(() => {
      router.push("/admin/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-red-600">
          Authentication Error
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
            {error === "Configuration"
              ? "There was a problem with the authentication configuration."
              : `Error: ${error}`}
          </div>
        )}

        <p className="text-center text-gray-600">
          You will be redirected to the login page in a few seconds...
        </p>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/admin/login")}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
