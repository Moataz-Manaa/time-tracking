import React, { useState, useEffect } from "react";
import moment from "moment";

// eslint-disable-next-line react/prop-types
const WeekDays = ({ onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(moment().startOf("isoWeek"));
  const [selectedDay, setSelectedDay] = useState(moment());
  /*
  useEffect(() => {
    onDateChange(selectedDay.toDate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
*/
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
  };

  const handlePrevWeek = () => {
    const newDate = currentDate.clone().subtract(1, "week");
    setCurrentDate(newDate);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    onDateChange(day.toDate());
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
            className={`p-2 text-center rounded cursor-pointer ${
              selectedDay.isSame(day, "day")
                ? "bg-blue-400"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
            onClick={() => handleDayClick(day)}
          >
            {day.format("ddd DD")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekDays;
