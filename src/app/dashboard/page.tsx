"use client";

import { useState } from "react";
import { useMeals, useWorkouts, useWaterLogs } from "@/lib/queries";
import DateFilter from "@/components/ui/DateFilter";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: meals = [] } = useMeals(selectedDate);
  const { data: workouts = [] } = useWorkouts(selectedDate);
  const { data: waterLogs = [] } = useWaterLogs(selectedDate);

  // Calculate totals
  const totalCaloriesConsumed = meals.reduce(
    (sum, meal) => sum + meal.calories,
    0
  );
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalCaloriesBurned = workouts.reduce(
    (sum, w) => sum + w.caloriesBurned,
    0
  );
  const totalWater = waterLogs.reduce((sum, log) => sum + log.amount, 0);

  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Track your health data</p>
      </div>

      {/* Date Filter */}
      <DateFilter
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showLabel={false}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Net Calories */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Net Calories</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{netCalories}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalCaloriesConsumed} in - {totalCaloriesBurned} out
          </p>
        </div>

        {/* Water */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Water</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {(totalWater / 1000).toFixed(1)}L
          </p>
          <p className="text-xs text-gray-500 mt-1">{totalWater}ml total</p>
        </div>

        {/* Protein */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Protein</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalProtein}g
          </p>
        </div>

        {/* Carbs */}
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Carbs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCarbs}g</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Add</h3>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/dashboard/meals"
            className="bg-blue-50 text-blue-700 py-3 px-4 rounded-lg text-center font-medium hover:bg-blue-100"
          >
            🍽️ Log Meal
          </a>
          <a
            href="/dashboard/workouts"
            className="bg-green-50 text-green-700 py-3 px-4 rounded-lg text-center font-medium hover:bg-green-100"
          >
            💪 Log Workout
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
        {meals.length === 0 && workouts.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity for this date</p>
        ) : (
          <div className="space-y-2">
            {[...meals, ...workouts]
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .slice(0, 5)
              .map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {"protein" in item ? "🍽️" : "💪"} {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {"calories" in item
                      ? `${item.calories} cal`
                      : `${item.caloriesBurned} cal`}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
