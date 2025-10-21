"use client";

import { useState } from "react";
import {
  useMeals,
  useAddMeal,
  useUserProfile,
  useDeleteMeal,
} from "@/lib/queries";
import { useEstimateMeal } from "@/lib/ai-queries";
import DateFilter from "@/components/ui/DateFilter";

export default function MealsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: meals = [] } = useMeals(selectedDate);
  const { data: profile } = useUserProfile();
  const addMeal = useAddMeal();
  const estimateMeal = useEstimateMeal();
  const deleteMeal = useDeleteMeal();

  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [useAI, setUseAI] = useState(true);

  // Manual entry fields
  const [manualData, setManualData] = useState({
    protein: "",
    carbs: "",
    fats: "",
    calories: "",
  });

  const [aiEstimate, setAiEstimate] = useState<{
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  } | null>(null);

  const handleGetEstimate = async () => {
    if (!description.trim() || !profile) return;

    try {
      const estimate = await estimateMeal.mutateAsync({
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
        await addMeal.mutateAsync({
          description,
          protein: aiEstimate.protein,
          carbs: aiEstimate.carbs,
          fats: aiEstimate.fats,
          calories: aiEstimate.calories,
          isAIEstimated: true,
          timestamp: new Date(),
        });
      } else {
        // Save manual entry
        await addMeal.mutateAsync({
          description,
          protein: Number(manualData.protein),
          carbs: Number(manualData.carbs),
          fats: Number(manualData.fats),
          calories: Number(manualData.calories),
          isAIEstimated: false,
          timestamp: new Date(),
        });
      }

      // Reset form
      setDescription("");
      setManualData({ protein: "", carbs: "", fats: "", calories: "" });
      setAiEstimate(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add meal:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this meal?")) {
      try {
        await deleteMeal.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete meal:", error);
      }
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meals</h2>
          <p className="text-sm text-gray-600">Track your nutrition</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          {showAddForm ? "Cancel" : "+ Add Meal"}
        </button>
      </div>

      {/* Date Filter */}
      <DateFilter
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showLabel={false}
      />

      {/* Add Meal Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Fried paneer with ghee"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  disabled={!description.trim() || estimateMeal.isPending}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-purple-700 disabled:bg-purple-400"
                >
                  {estimateMeal.isPending ? "Estimating..." : "✨ Estimate"}
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
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-semibold ml-1">
                      {aiEstimate.protein}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="font-semibold ml-1">
                      {aiEstimate.carbs}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fats:</span>
                    <span className="font-semibold ml-1">
                      {aiEstimate.fats}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-semibold ml-1">
                      {aiEstimate.calories}
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
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    required
                    value={manualData.protein}
                    onChange={(e) =>
                      setManualData({ ...manualData, protein: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    required
                    value={manualData.carbs}
                    onChange={(e) =>
                      setManualData({ ...manualData, carbs: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    required
                    value={manualData.fats}
                    onChange={(e) =>
                      setManualData({ ...manualData, fats: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    required
                    value={manualData.calories}
                    onChange={(e) =>
                      setManualData({ ...manualData, calories: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={addMeal.isPending || (useAI && !aiEstimate)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 font-medium"
            >
              {addMeal.isPending ? "Saving..." : "Save Meal"}
            </button>
          </form>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Daily Total</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{totalCalories}</p>
            <p className="text-xs text-gray-600">Calories</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{totalProtein}g</p>
            <p className="text-xs text-gray-600">Protein</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{totalCarbs}g</p>
            <p className="text-xs text-gray-600">Carbs</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded">
            <p className="text-2xl font-bold text-gray-900">{totalFats}g</p>
            <p className="text-xs text-gray-600">Fats</p>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Meals ({meals.length})
          </h3>
        </div>
        {meals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No meals logged yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Tap &quot;+ Add Meal&quot; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {meals.map((meal) => (
              <div key={meal.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {meal.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {meal.timestamp.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {meal.isAIEstimated && (
                        <span className="ml-2 text-purple-600">
                          ✨ AI Estimated
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">
                      {meal.calories}
                    </p>
                    <button
                      onClick={() => handleDelete(meal.id!)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>P: {meal.protein}g</span>
                  <span>C: {meal.carbs}g</span>
                  <span>F: {meal.fats}g</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
