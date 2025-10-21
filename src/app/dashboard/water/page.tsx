"use client";

import { useState } from "react";
import {
  useWaterLogs,
  useAddWater,
  useTargets,
  useDeleteWater,
} from "@/lib/queries";
import DateFilter from "@/components/ui/DateFilter";

export default function WaterPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: waterLogs = [] } = useWaterLogs(selectedDate);
  const { data: targets } = useTargets();
  const addWater = useAddWater();
  const deleteWater = useDeleteWater();

  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const quickAmounts = [250, 500, 750, 1000]; // ml

  const handleQuickAdd = async (amount: number) => {
    try {
      await addWater.mutateAsync(amount);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
      console.error("Failed to add water:", error);
    }
  };

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (amount > 0) {
      try {
        await addWater.mutateAsync(amount);
        setCustomAmount("");
        setShowCustom(false);
      } catch (error) {
        console.error("Failed to add water:", error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this water log?")) {
      try {
        await deleteWater.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete water log:", error);
      }
    }
  };

  const totalWater = waterLogs.reduce((sum, log) => sum + log.amount, 0);
  const targetWater = targets?.waterTarget || 3000;
  const progress = Math.min((totalWater / targetWater) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Water Intake</h2>
        <p className="text-sm text-gray-600">Stay hydrated</p>
      </div>

      {/* Date Filter */}
      <DateFilter
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showLabel={false}
      />

      {/* Progress Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-blue-600">
            {(totalWater / 1000).toFixed(2)}L
          </p>
          <p className="text-sm text-gray-600 mt-1">
            of {targetWater / 1000}L daily goal
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-center text-sm text-gray-600">
          {progress >= 100
            ? "🎉 Goal reached!"
            : `${Math.round(progress)}% complete`}
        </p>
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Add</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAdd(amount)}
              disabled={addWater.isPending}
              className="bg-blue-50 text-blue-700 py-4 px-4 rounded-lg text-center font-medium hover:bg-blue-100 disabled:bg-blue-200 disabled:cursor-not-allowed"
            >
              <p className="text-2xl font-bold">{amount}ml</p>
              <p className="text-xs mt-1">
                {amount === 250 && "🥤 Glass"}
                {amount === 500 && "💧 Bottle"}
                {amount === 750 && "🍶 Large"}
                {amount === 1000 && "🚰 Liter"}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mt-3">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              + Custom Amount
            </button>
          ) : (
            <form onSubmit={handleCustomAdd} className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Amount in ml"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={!customAmount || addWater.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustom(false);
                  setCustomAmount("");
                }}
                className="text-gray-600 px-3 text-sm"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Water Log */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Water Log ({waterLogs.length})
          </h3>
        </div>
        {waterLogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No water logged yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Tap a quick add button to start
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {waterLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">{log.amount}ml</p>
                  <p className="text-xs text-gray-500">
                    {log.timestamp.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💧</span>
                  <button
                    onClick={() => handleDelete(log.id!)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-1">
          💡 Hydration Tips
        </p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Drink water first thing in the morning</li>
          <li>• Keep a water bottle nearby while studying</li>
          <li>• Drink before you feel thirsty</li>
        </ul>
      </div>
    </div>
  );
}
