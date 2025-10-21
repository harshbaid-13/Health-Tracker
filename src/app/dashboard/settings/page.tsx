"use client";

import { useState, useEffect } from "react";
import {
  useSettings,
  useUpdateSettings,
  useUserProfile,
  useUpdateUserProfile,
  useTargets,
  useUpdateTargets,
} from "@/lib/queries";
import { useEstimateDailyTargets } from "@/lib/ai-queries";

export default function SettingsPage() {
  const { data: settings } = useSettings();
  const { data: profile } = useUserProfile();
  const { data: targets } = useTargets();
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateUserProfile();
  const updateTargets = useUpdateTargets();
  const estimateDailyTargets = useEstimateDailyTargets();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [targetData, setTargetData] = useState({
    waterTarget: "3000",
    sleepTarget: "8",
    calorieTarget: "2000",
    proteinTarget: "150",
  });
  const [profileData, setProfileData] = useState({
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

  useEffect(() => {
    if (settings?.geminiApiKey) {
      setApiKey(settings.geminiApiKey);
      setApiKeySaved(true);
    }
  }, [settings]);

  useEffect(() => {
    if (profile) {
      setProfileData({
        height: profile.height.toString(),
        weight: profile.weight.toString(),
        age: profile.age.toString(),
        gender: profile.gender,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (targets) {
      setTargetData({
        waterTarget: targets.waterTarget.toString(),
        sleepTarget: targets.sleepTarget.toString(),
        calorieTarget: targets.calorieTarget.toString(),
        proteinTarget: targets.proteinTarget.toString(),
      });
    }
  }, [targets]);

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}${"*".repeat(key.length - 8)}${key.slice(-4)}`;
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      alert("Please enter an API key");
      return;
    }

    try {
      await updateSettings.mutateAsync({ geminiApiKey: apiKey });
      setApiKeySaved(true);
      setShowApiKey(false);
      alert("API key saved successfully!");
    } catch (error) {
      console.error("Failed to save API key:", error);
      alert("Failed to save API key");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) return;

    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        data: {
          height: Number(profileData.height),
          weight: Number(profileData.weight),
          age: Number(profileData.age),
          gender: profileData.gender,
          activityLevel: profileData.activityLevel,
          goal: profileData.goal,
        },
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleEstimateTargets = async () => {
    if (!profile) {
      alert("Please complete your profile first");
      return;
    }

    try {
      const estimates = await estimateDailyTargets.mutateAsync(profile);
      setTargetData({
        waterTarget: estimates.waterTarget.toString(),
        sleepTarget: estimates.sleepTarget.toString(),
        calorieTarget: estimates.calorieTarget.toString(),
        proteinTarget: estimates.proteinTarget.toString(),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to estimate targets");
      }
      console.error("Failed to estimate targets:", error);
    }
  };

  const handleListModels = async () => {
    if (!settings?.geminiApiKey) {
      alert("Please save your API key first");
      return;
    }

    try {
      const { listAvailableModels } = await import("@/lib/gemini");
      const models = await listAvailableModels(settings.geminiApiKey);
      console.log("Available Gemini Models:", models);
      alert(
        `Available models (check console for details):\n\n${models
          .map((m: { name: string }) => m.name)
          .join("\n")}`
      );
    } catch (error) {
      console.error("Failed to list models:", error);
      alert("Failed to list models. Check console for details.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-600">Manage your app preferences</p>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Gemini API Key</h3>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-900 font-medium mb-1">
            ⚠️ Keep your key private
          </p>
          <p className="text-xs text-yellow-800">
            Your API key is stored locally and sent directly to Google. Never
            share this key. Regenerate it if compromised.
          </p>
        </div>

        {apiKeySaved && !showApiKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={maskApiKey(apiKey)}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
              <button
                onClick={() => setShowApiKey(true)}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 px-3"
              >
                Edit
              </button>
            </div>
            <p className="text-xs text-green-600">✓ API key configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveApiKey}
                disabled={updateSettings.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium"
              >
                {updateSettings.isPending ? "Saving..." : "Save Key"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(apiKey);
                  alert("API key copied to clipboard");
                }}
                className="text-gray-600 text-sm font-medium hover:text-gray-900 px-3"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600 mb-2">
            Don&apos;t have an API key?
          </p>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Get your free Gemini API key →
          </a>

          <div className="mt-3">
            <button
              onClick={handleListModels}
              disabled={!apiKeySaved}
              className="text-xs text-gray-600 hover:text-gray-900 underline disabled:text-gray-400"
            >
              🔍 List available models (debug)
            </button>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Profile</h3>
        <p className="text-xs text-gray-600 mb-4">
          Used by AI to estimate meals and workouts accurately
        </p>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                required
                value={profileData.height}
                onChange={(e) =>
                  setProfileData({ ...profileData, height: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                required
                value={profileData.weight}
                onChange={(e) =>
                  setProfileData({ ...profileData, weight: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                required
                value={profileData.age}
                onChange={(e) =>
                  setProfileData({ ...profileData, age: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={profileData.gender}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    gender: e.target.value as "male" | "female" | "other",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Level
            </label>
            <select
              value={profileData.activityLevel}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  activityLevel: e.target.value as
                    | "sedentary"
                    | "light"
                    | "moderate"
                    | "active"
                    | "very_active",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal
            </label>
            <select
              value={profileData.goal}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  goal: e.target.value as "lose" | "maintain" | "gain",
                })
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
            disabled={updateProfile.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
          >
            {updateProfile.isPending ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      {/* Daily Targets Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">Daily Targets</h3>
          <button
            type="button"
            onClick={handleEstimateTargets}
            disabled={estimateDailyTargets.isPending || !profile}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-purple-700 disabled:bg-purple-400"
          >
            {estimateDailyTargets.isPending
              ? "Estimating..."
              : "✨ Help me estimate"}
          </button>
        </div>

        {estimateDailyTargets.isPending && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-900">
              AI is analyzing your profile to recommend personalized targets...
            </p>
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await updateTargets.mutateAsync({
                waterTarget: Number(targetData.waterTarget),
                sleepTarget: Number(targetData.sleepTarget),
                calorieTarget: Number(targetData.calorieTarget),
                proteinTarget: Number(targetData.proteinTarget),
              });
              alert("Targets updated successfully!");
            } catch (error) {
              console.error("Failed to update targets:", error);
              alert("Failed to update targets");
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Water Target (ml)
            </label>
            <input
              type="number"
              value={targetData.waterTarget}
              onChange={(e) =>
                setTargetData({ ...targetData, waterTarget: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(Number(targetData.waterTarget) / 1000).toFixed(1)}L per day
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sleep Target (hours)
            </label>
            <input
              type="number"
              step="0.5"
              value={targetData.sleepTarget}
              onChange={(e) =>
                setTargetData({ ...targetData, sleepTarget: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Calorie Target
            </label>
            <input
              type="number"
              value={targetData.calorieTarget}
              onChange={(e) =>
                setTargetData({ ...targetData, calorieTarget: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Protein Target (g)
            </label>
            <input
              type="number"
              value={targetData.proteinTarget}
              onChange={(e) =>
                setTargetData({ ...targetData, proteinTarget: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={updateTargets.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
          >
            {updateTargets.isPending ? "Updating..." : "Update Targets"}
          </button>
        </form>
      </div>

      {/* About */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-2">About</h3>
        <p className="text-sm text-gray-600 mb-2">Health Tracker v1.0</p>
        <p className="text-xs text-gray-500">
          A local-first, AI-powered health tracking app. All your data stays on
          your device.
        </p>
      </div>
    </div>
  );
}
