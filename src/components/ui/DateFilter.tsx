"use client";

interface DateFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  showLabel?: boolean;
}

export default function DateFilter({
  selectedDate,
  onDateChange,
  showLabel = true,
}: DateFilterProps) {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday =
    formatDateForInput(selectedDate) === formatDateForInput(new Date());
  const isFuture = selectedDate > new Date();

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
      )}
      <div className="flex items-center gap-2">
        {/* Previous Day Button */}
        <button
          onClick={goToPreviousDay}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          aria-label="Previous day"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Date Input */}
        <input
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={(e) => onDateChange(new Date(e.target.value + "T00:00:00"))}
          max={formatDateForInput(new Date())}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-medium"
        />

        {/* Next Day Button */}
        <button
          onClick={goToNextDay}
          disabled={isFuture}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next day"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Today Button */}
        {!isToday && (
          <button
            onClick={goToToday}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Today
          </button>
        )}
      </div>

      {/* Display Selected Date */}
      <p className="text-center text-sm text-gray-600 mt-2">
        {selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
