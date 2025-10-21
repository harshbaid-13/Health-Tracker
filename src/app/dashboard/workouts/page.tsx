"use client";

import { useState } from "react";
import {
  useWorkouts,
  useAddWorkout,
  useUserProfile,
  useDeleteWorkout,
} from "@/lib/queries";
import { useEstimateWorkout } from "@/lib/ai-queries";
import DateFilter from "@/components/ui/DateFilter";

export default function WorkoutsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: workouts = [] } = useWorkouts(selectedDate);
  const { data: profile } = useUserProfile();
  const addWorkout = useAddWorkout();
  const estimateWorkout = useEstimateWorkout();
  const deleteWorkout = useDeleteWorkout();

  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [useAI, setUseAI] = useState(true);

  // Manual entry fields
  const [manualData, setManualData] = useState({
    caloriesBurned: "",
    duration: "",
  });

  const [aiEstimate, setAiEstimate] = useState<{
    caloriesBurned: number;
    duration: number;
  } | null>(null);

  const handleGetEstimate = async () => {
    if (!description.trim() || !profile) return;

    try {
      const estimate = await estimateWorkout.mutateAsync({
        description,
        userProfile: profile,
      });
      setAiEstimate(estimate);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) return;

    try {
      if (useAI && aiEstimate) {
        // Save AI estimate
        await addWorkout.mutateAsync({
          description,
          caloriesBurned: aiEstimate.caloriesBurned,
          duration: aiEstimate.duration,
          isAIEstimated: true,
          timestamp: new Date(),
        });
      } else {
        // Save manual entry
        await addWorkout.mutateAsync({
          description,
          caloriesBurned: Number(manualData.caloriesBurned),
          duration: Number(manualData.duration),
          isAIEstimated: false,
          timestamp: new Date(),
        });
      }

      // Reset form
      setDescription("");
      setManualData({ caloriesBurned: "", duration: "" });
      setAiEstimate(null);
      setShowAddForm(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this workout?")) {
      try {
        await deleteWorkout.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete workout:", error);
      }
    }
  };

  const totalCaloriesBurned = workouts.reduce(
    (sum, w) => sum + w.caloriesBurned,
    0
  );
  const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workouts</h2>
          <p className="text-sm text-gray-600">Track your exercise</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
        >
          {showAddForm ? "Cancel" : "+ Add Workout"}
        </button>
      </div>

      {/* Date Filter */}
      <DateFilter
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showLabel={false}
      />

      {/* Add Workout Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workout Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Bench Press, 3 sets of 12 reps at 35 kg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => {
                    setUseAI(e.target.checked);
                    setAiEstimate(null);
                  }}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Use AI Estimation
                </span>
              </label>
              {useAI && (
                <button
                  type="button"
                  onClick={handleGetEstimate}
                  disabled={!description.trim() || estimateWorkout.isPending}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-purple-700 disabled:bg-purple-400"
                >
                  {estimateWorkout.isPending ? "Estimating..." : "✨ Estimate"}
                </button>
              )}
            </div>

            {/* AI Estimate Display */}
            {useAI && aiEstimate && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  AI Estimate:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Calories Burned:</span>
                    <span className="font-semibold ml-1">
                      {aiEstimate.caloriesBurned}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold ml-1">
                      {aiEstimate.duration} min
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            {!useAI && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories Burned
                  </label>
                  <input
                    type="number"
                    required
                    value={manualData.caloriesBurned}
                    onChange={(e) =>
                      setManualData({
                        ...manualData,
                        caloriesBurned: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={manualData.duration}
                    onChange={(e) =>
                      setManualData({ ...manualData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={addWorkout.isPending || (useAI && !aiEstimate)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-400 font-medium"
            >
              {addWorkout.isPending ? "Saving..." : "Save Workout"}
            </button>
          </form>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Daily Total</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">
              {totalCaloriesBurned}
            </p>
            <p className="text-xs text-gray-600">Calories Burned</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{totalDuration}</p>
            <p className="text-xs text-gray-600">Minutes</p>
          </div>
        </div>
      </div>

      {/* Workouts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Workouts ({workouts.length})
          </h3>
        </div>
        {workouts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No workouts logged yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Tap &quot;+ Add Workout&quot; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {workouts.map((workout) => (
              <div key={workout.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {workout.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {workout.timestamp.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {workout.isAIEstimated && (
                        <span className="ml-2 text-purple-600">
                          ✨ AI Estimated
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {workout.caloriesBurned}
                      </p>
                      <p className="text-xs text-gray-500">cal</p>
                    </div>
                    <button
                      onClick={() => handleDelete(workout.id!)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Duration: {workout.duration} min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
