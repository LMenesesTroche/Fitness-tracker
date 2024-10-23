import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../fireBaseConfig"; // Asegúrate de que la ruta esté correcta
import "./tracker.css";
import Select from "react-select";

const daysInWeek = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
// const daysInWeek = ['Lun', '', 'Mie', '', 'Vie', '', 'Dom'];
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
  // Estilos para el componente "control" (el contenedor del select visible)
  control: (provided) => ({
    // Se toma el estilo predeterminado del componente usando el objeto "provided"
    ...provided,
    backgroundColor: "#1a1a1a", // Color de fondo del dropdown (negro oscuro)
    borderColor: "#ffffff", // Color del borde (morado neón)
    color: "#ffffff", // Color del texto (blanco)
    // Aquí puedes añadir más propiedades CSS si lo deseas, por ejemplo, para cambiar el tamaño o agregar padding.
  }),

  // Estilos para cada "option" (las opciones dentro del dropdown)
  option: (provided, state) => ({
    // Nuevamente, usamos los estilos predeterminados como base
    ...provided,
    fontSize: "large", // Se cambia el tamaño de la fuente para que sea más grande
    textAlign: "center", // Alinear texto al centro
    backgroundColor: state.isSelected // Si la opción está seleccionada, se aplica el color de fondo morado
      ? "#5a53cf" // Color de fondo para la opción seleccionada (morado neón)
      : "#1a1a1a", // Color de fondo para las opciones no seleccionadas (negro oscuro)

    // Puedes modificar otras propiedades aquí como `padding`, `border`, o agregar efectos como hover:
    // Ejemplo: agregar un hover effect
    ":hover": { backgroundColor: "#323232" }, // Cambiar el fondo al pasar el mouse
  }),

  // Estilos para el valor seleccionado que aparece en el input cuando se elige una opción
  singleValue: (provided) => ({
    ...provided, // Toma los estilos predeterminados
    color: "#ffffff", // Cambia el color del texto seleccionado (Blanco)
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
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
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

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleDayClick = async (week, day) => {
    const updatedDays = { ...exerciseDays };
    if (!updatedDays[week]) {
      updatedDays[week] = {};
    }

    const date = getDayOfWeekDate(week, day);

    updatedDays[week][day] = {
      exercise: selectedExercise === "descanso" ? "Descanso" : selectedExercise,
      date,
    };

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
    const { week, day } = getCurrentWeekAndDay();
    setModalData({ week, day, existingExercise: null }); // Mostrar modal para el día de hoy
    setShowModal(true);
  };

  const handleCubeClick = (weekIndex, dayIndex) => {
    const existingExercise =
      exerciseDays[weekIndex] && exerciseDays[weekIndex][dayIndex]
        ? exerciseDays[weekIndex][dayIndex].exercise
        : null;

    setModalData({ week: weekIndex, day: dayIndex, existingExercise }); // Almacenar el día que se quiere modificar
    setSelectedExercise(existingExercise || ""); // Preseleccionar el tipo de ejercicio existente
    setShowModal(true); // Mostrar modal para modificar
  };

  const handleSubmit = () => {
    const { week, day } = modalData;

    // Verificar si hay un ejercicio seleccionado antes de registrar el día
    if (selectedExercise) {
      handleDayClick(week, day);
    } else {
      alert("Selecciona un tipo de ejercicio.");
    }

    setShowModal(false); // Ocultar el modal después de confirmar
  };

  return (
    <div className="contenedor-del-componente">
      <h1>Fitness Tracker</h1>
      <div className="rectangulo-importante">
      <div className="caja-nombres-meses">
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
                      ? exerciseDays[weekIndex][dayIndex].exercise ===
                        "Descanso"
                        ? "rest-day"
                        : "active"
                      : ""
                  }`}
                  onClick={() => handleCubeClick(weekIndex, dayIndex)} // Click izquierdo para editar
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
              isSearchable={!isMobile} // Desactiva la búsqueda si está en un dispositivo móvil
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
