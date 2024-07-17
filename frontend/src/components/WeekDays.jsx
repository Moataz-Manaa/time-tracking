import React, { useState } from "react";
import moment from "moment";

// eslint-disable-next-line react/prop-types
const WeekDays = ({ onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(moment().startOf("isoWeek"));

  const getWeekDays = (start) => {
    let days = [];
    for (let i = 0; i < 7; i++) {
      days.push(moment(start).add(i, "days"));
    }
    return days;
  };

  const handleNextWeek = () => {
    const newDate = currentDate.clone().add(1, "week");
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  const handlePrevWeek = () => {
    const newDate = currentDate.clone().subtract(1, "week");
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button onClick={handlePrevWeek} className="p-2 bg-gray-300 rounded">
          Prev
        </button>
        <span className="font-bold">{currentDate.format("MMMM YYYY")}</span>
        <button onClick={handleNextWeek} className="p-2 bg-gray-300 rounded">
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {getWeekDays(currentDate).map((day, index) => (
          <div
            key={index}
            className="p-2 bg-blue-200 text-center rounded cursor-pointer hover:bg-blue-300"
            onClick={() => onDateChange(day.toDate())}
          >
            {day.format("ddd DD")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekDays;
