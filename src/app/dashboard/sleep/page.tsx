"use client";

import { useState } from "react";
import {
  useSleepLogs,
  useAddSleep,
  useTargets,
  useDeleteSleep,
} from "@/lib/queries";
import DateFilter from "@/components/ui/DateFilter";

export default function SleepPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Show last 30 days ending on selected date
  const endDate = new Date(selectedDate);
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - 29);

  const { data: sleepLogs = [] } = useSleepLogs(startDate, endDate);
  const { data: targets } = useTargets();
  const addSleep = useAddSleep();
  const deleteSleep = useDeleteSleep();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: selectedDate.toISOString().split("T")[0],
    duration: "",
    quality: "good" as "poor" | "fair" | "good" | "excellent",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addSleep.mutateAsync({
        date: formData.date,
        duration: Number(formData.duration),
        quality: formData.quality,
        source: "manual",
      });

      // Reset form
      setFormData({
        date: selectedDate.toISOString().split("T")[0],
        duration: "",
        quality: "good",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add sleep:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this sleep log?")) {
      try {
        await deleteSleep.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete sleep log:", error);
      }
    }
  };

  // Get last 7 days average
  const recentLogs = sleepLogs.slice(0, 7);
  const avgSleep =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.duration, 0) /
        recentLogs.length
      : 0;

  const targetSleep = targets?.sleepTarget || 8;

  const qualityColors = {
    poor: "text-red-600 bg-red-50",
    fair: "text-orange-600 bg-orange-50",
    good: "text-green-600 bg-green-50",
    excellent: "text-blue-600 bg-blue-50",
  };

  const qualityEmojis = {
    poor: "😴",
    fair: "😐",
    good: "😊",
    excellent: "🌟",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sleep</h2>
          <p className="text-sm text-gray-600">Track your sleep quality</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
        >
          {showAddForm ? "Cancel" : "+ Log Sleep"}
        </button>
      </div>

      {/* Date Filter */}
      <DateFilter
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        showLabel={false}
      />

      {/* Add Sleep Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                max={selectedDate.toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="7.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleep Quality
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["poor", "fair", "good", "excellent"] as const).map(
                  (quality) => (
                    <button
                      key={quality}
                      type="button"
                      onClick={() => setFormData({ ...formData, quality })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        formData.quality === quality
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{qualityEmojis[quality]}</span>
                      <p className="text-sm mt-1 capitalize">{quality}</p>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={addSleep.isPending}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 font-medium"
            >
              {addSleep.isPending ? "Saving..." : "Save Sleep Log"}
            </button>
          </form>
        </div>
      )}

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600">
              {avgSleep.toFixed(1)}h
            </p>
            <p className="text-sm text-gray-600 mt-1">7-Day Average</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{targetSleep}h</p>
            <p className="text-sm text-gray-600 mt-1">Recommended</p>
          </div>
        </div>

        {avgSleep > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-center text-gray-600">
              {avgSleep >= targetSleep
                ? "✅ Meeting your sleep goals!"
                : `⚠️ ${(targetSleep - avgSleep).toFixed(1)}h below target`}
            </p>
          </div>
        )}
      </div>

      {/* Sleep Log */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            Sleep History (Last 30 Days)
          </h3>
        </div>
        {sleepLogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No sleep logs yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Tap &quot;+ Log Sleep&quot; to start tracking
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {sleepLogs.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {new Date(log.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          qualityColors[log.quality]
                        }`}
                      >
                        {qualityEmojis[log.quality]} {log.quality}
                      </span>
                      {log.source === "google_fit" && (
                        <span className="text-xs text-gray-500">
                          📱 Google Fit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {log.duration}h
                    </p>
                    <button
                      onClick={() => handleDelete(log.id!)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sleep Tips */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm font-medium text-indigo-900 mb-1">
          💤 Better Sleep Tips
        </p>
        <ul className="text-xs text-indigo-800 space-y-1">
          <li>• Maintain a consistent sleep schedule</li>
          <li>• Avoid screens 1 hour before bed</li>
          <li>• Keep your room cool and dark</li>
          <li>• Limit caffeine after 2 PM</li>
        </ul>
      </div>
    </div>
  );
}
