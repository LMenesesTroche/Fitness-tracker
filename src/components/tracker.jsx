import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseConfig";
import Select from "react-select";
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

const options = [
  { value: "", label: "Seleccionar" },
  { value: "Hombros", label: "Hombros" },
  { value: "Piernas", label: "Piernas" },
  { value: "Espalda", label: "Espalda" },
  { value: "Cardio", label: "Cardio" },
  { value: "descanso", label: "Descanso" },
];

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#1a1a1a",
    borderColor: "#ffffff",
    color: "#ffffff",
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: "large",
    textAlign: "center",
    backgroundColor: state.isSelected ? "#5a53cf" : "#1a1a1a",
    ":hover": { backgroundColor: "#323232" },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#ffffff",
  }),
};

const getCurrentWeekAndDay = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000));
  const week = Math.floor(dayOfYear / 7);
  const day = today.getDay();
  return { week, day: day === 0 ? 6 : day - 1 };
};

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const ExerciseTracker = () => {
  const [exerciseDays, setExerciseDays] = useState({});
  const [selectedExercise, setSelectedExercise] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    week: null,
    day: null,
    existingExercise: null,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("exerciseDays");
    if (storedData) {
      setExerciseDays(JSON.parse(storedData));
    }
  }, []);



  const handleDayClick = (week, day) => {
    const updatedDays = { ...exerciseDays };
    if (!updatedDays[week]) {
      updatedDays[week] = {};
    }
    updatedDays[week][day] = {
      date: getDayOfWeekDate(week, day),
      exercise: selectedExercise,
    };
    setExerciseDays(updatedDays);
    localStorage.setItem("exerciseDays", JSON.stringify(updatedDays));
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
    const { week, day } = getCurrentWeekAndDay();
    setModalData({ week, day, existingExercise: null });
    setShowModal(true);
  };

  const handleCubeClick = (weekIndex, dayIndex) => {
    const existingExercise =
      exerciseDays[weekIndex] && exerciseDays[weekIndex][dayIndex]
        ? exerciseDays[weekIndex][dayIndex].exercise
        : null;

    setModalData({ week: weekIndex, day: dayIndex, existingExercise });
    setSelectedExercise(existingExercise || "");
    setShowModal(true);
  };

  const handleSubmit = () => {
    const { week, day } = modalData;
    if (selectedExercise) {
      handleDayClick(week, day); // This will update exerciseDays state
      setShowModal(false); // Close the modal after saving
    } else {
      alert("Selecciona un tipo de ejercicio.");
    }
  };
  

  return (
    <div className="contenedor-del-componente">
      <h1>Fitness Tracker</h1>
      <div className="rectangulo-importante">
        <div className="caja-nombres-meses">
          {months.map((month, index) => (
            <div key={index} className="texto-meses">
              {month}
            </div>
          ))}
        </div>
        <div className="texto-semanas-y-cubitos">
          <div className="contenedor-del-texto-dias">
            {daysInWeek.map((day, index) => (
              <div key={index} className="texto-dias">
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
                        ? exerciseDays[weekIndex][dayIndex].exercise ===
                          "Descanso"
                          ? "rest-day"
                          : "active"
                        : ""
                    }`}
                    onClick={() => handleCubeClick(weekIndex, dayIndex)}
                    title={
                      exerciseDays[weekIndex] && exerciseDays[weekIndex][dayIndex]
                        ? `${exerciseDays[weekIndex][dayIndex].date} "${exerciseDays[weekIndex][dayIndex].exercise}"`
                        : getDayOfWeekDate(weekIndex, dayIndex)
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>
                {modalData.existingExercise
                  ? "Editar ejercicio"
                  : "Selecciona el tipo de ejercicio"}
              </h2>
              <Select
                options={options}
                styles={customStyles}
                placeholder="Seleccionar"
                value={options.find(
                  (option) => option.value === selectedExercise
                )}
                onChange={(selectedOption) =>
                  setSelectedExercise(selectedOption.value)
                }
                isSearchable={!isMobile}
              />
              <div className="seccion-de-botones-modal">
                <button onClick={handleSubmit}>Confirmar</button>
                <button onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <button className="mark-today-btn" onClick={markToday}>
        Marcar Hoy
      </button>
    </div>
  );
};

export default ExerciseTracker;
