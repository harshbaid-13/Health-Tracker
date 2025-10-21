"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/lib/queries";

export default function HomePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useUserProfile();

  useEffect(() => {
    if (!isLoading) {
      if (profile) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
  }, [profile, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
