import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";

// eslint-disable-next-line react/prop-types
const WeekDays = ({ onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(
    DateTime.now().startOf("week")
  );
  const [selectedDay, setSelectedDay] = useState(DateTime.now());

  const getWeekDays = (start) => {
    let days = [];
    for (let i = 0; i < 7; i++) {
      days.push(start.plus({ days: i }));
    }
    return days;
  };

  const handleNextWeek = () => {
    const newDate = currentDate.plus({ weeks: 1 });
    setCurrentDate(newDate);
  };

  const handlePrevWeek = () => {
    const newDate = currentDate.minus({ weeks: 1 });
    setCurrentDate(newDate);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    onDateChange(day.toJSDate());
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button onClick={handlePrevWeek} className="p-2 bg-gray-300 rounded">
          Prev
        </button>
        <span className="font-bold">{currentDate.toFormat("MMMM yyyy")}</span>
        <button onClick={handleNextWeek} className="p-2 bg-gray-300 rounded">
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {getWeekDays(currentDate).map((day, index) => (
          <div
            key={index}
            className={`p-2 text-center rounded cursor-pointer ${
              selectedDay.hasSame(day, "day")
                ? "bg-blue-400"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
            onClick={() => handleDayClick(day)}
          >
            {day.toFormat("ccc dd")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekDays;
