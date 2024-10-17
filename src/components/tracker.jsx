import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../fireBaseConfig"; // Asegúrate de que la ruta esté correcta
import "./tracker.css";

const daysInWeek = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const months = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const weeksInYear = 52;

const getCurrentWeekAndDay = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000));
  const week = Math.floor(dayOfYear / 7);
  const day = today.getDay();
  return { week, day: day === 0 ? 6 : day - 1 };
};

const formatDate = (date) => {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
};

const ExerciseTracker = () => {
  const [exerciseDays, setExerciseDays] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(""); // Estado para almacenar el tipo de ejercicio

  useEffect(() => {
    const fetchData = async () => {
      const userDoc = doc(db, "exerciseDays", "user1");
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        setExerciseDays(docSnap.data());
      } else {
        console.log("No hay datos disponibles en Firebase.");
      }
    };

    fetchData();
  }, []);

  const handleDayClick = async (week, day) => {
    const updatedDays = { ...exerciseDays };
    if (!updatedDays[week]) {
      updatedDays[week] = {};
    }

    updatedDays[week][day] =
      selectedExercise === "descanso" ? "descanso" : selectedExercise;
    setExerciseDays(updatedDays);

    const userDoc = doc(db, "exerciseDays", "user1");
    await setDoc(userDoc, updatedDays);
  };

  const getDayOfWeekDate = (weekIndex, dayIndex) => {
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
    const daysToAdd = weekIndex * 7 + dayIndex;
    const targetDate = new Date(
      firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd)
    );
    return formatDate(targetDate);
  };

  const markToday = () => {
    const exerciseType = prompt(
      "¿Qué tipo de ejercicio hiciste hoy? (Escribe: hombros, piernas, espalda, cardio, descanso)"
    );

    if (
      ["hombros", "piernas", "espalda", "cardio", "descanso"].includes(
        exerciseType
      )
    ) {
      setSelectedExercise(exerciseType);
      const { week, day } = getCurrentWeekAndDay();
      handleDayClick(week, day);
    } else {
      alert("Tipo de ejercicio no válido. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="tracker-container">
      <h1>Fitness Tracker</h1>
      <div className="grid-header">
        {months.map((month, index) => (
          <div key={index} className="month-label">
            {month}
          </div>
        ))}
      </div>
      <div className="grid-container">
        <div className="week-labels">
          {daysInWeek.map((day, index) => (
            <div key={index} className="day-label">
              {day}
            </div>
          ))}
        </div>
        <div className="weeks-grid">
          {Array.from({ length: weeksInYear }).map((_, weekIndex) => (
            <div key={weekIndex} className="week-column">
              {daysInWeek.map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`day-box ${
                    exerciseDays[weekIndex] && exerciseDays[weekIndex][dayIndex]
                      ? exerciseDays[weekIndex][dayIndex] === "descanso"
                        ? "rest-day"
                        : "active"
                      : ""
                  }`}
                  onClick={() => handleDayClick(weekIndex, dayIndex)}
                  title={getDayOfWeekDate(weekIndex, dayIndex)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <button className="mark-today-btn" onClick={markToday}>
        Marcar Hoy
      </button>
    </div>
  );
};

export default ExerciseTracker;
