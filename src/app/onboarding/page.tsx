"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUserProfile } from "@/lib/queries";

export default function OnboardingPage() {
  const router = useRouter();
  const createProfile = useCreateUserProfile();

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    age: "",
    gender: "male" as "male" | "female" | "other",
    activityLevel: "moderate" as
      | "sedentary"
      | "light"
      | "moderate"
      | "active"
      | "very_active",
    goal: "maintain" as "lose" | "maintain" | "gain",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProfile.mutateAsync({
        height: Number(formData.height),
        weight: Number(formData.weight),
        age: Number(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
        <p className="text-gray-600 mb-6">
          Let&apos;s set up your profile for accurate AI estimates
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              required
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="170"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              required
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="70"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              required
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Level
            </label>
            <select
              value={formData.activityLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  activityLevel: e.target.value as "sedentary" | "light" | "moderate" | "active" | "very_active",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="light">Light (1-3 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="very_active">Very Active (intense daily)</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal
            </label>
            <select
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value as "lose" | "maintain" | "gain" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lose">Lose Weight</option>
              <option value="maintain">Maintain Weight</option>
              <option value="gain">Gain Weight</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={createProfile.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
          >
            {createProfile.isPending ? "Creating..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
