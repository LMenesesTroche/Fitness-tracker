import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../fireBaseConfig'; // Asegúrate de que la ruta esté correcta
import './tracker.css';

const daysInWeek = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
// const daysInWeek = ['Lun', '', 'Mie', '', 'Vie', '', 'Dom'];
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
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
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  });
};

const ExerciseTracker = () => {
  const [exerciseDays, setExerciseDays] = useState({});
  const [selectedExercise, setSelectedExercise] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ week: null, day: null, existingExercise: null });

  useEffect(() => {
    const fetchData = async () => {
      const userDoc = doc(db, 'exerciseDays', 'user1');
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

    const date = getDayOfWeekDate(week, day);

    updatedDays[week][day] = {
      exercise: selectedExercise === 'descanso' ? 'Descanso' : selectedExercise,
      date,
    };
    
    setExerciseDays(updatedDays);

    const userDoc = doc(db, 'exerciseDays', 'user1');
    await setDoc(userDoc, updatedDays);
  };

  const getDayOfWeekDate = (weekIndex, dayIndex) => {
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
    const daysToAdd = weekIndex * 7 + dayIndex;
    const targetDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd));
    return formatDate(targetDate);
  };

  const markToday = () => {
    const { week, day } = getCurrentWeekAndDay();
    setModalData({ week, day, existingExercise: null }); // Mostrar modal para el día de hoy
    setShowModal(true);
  };

  const handleCubeClick = (weekIndex, dayIndex) => {
    const existingExercise = exerciseDays[weekIndex] && exerciseDays[weekIndex][dayIndex]
      ? exerciseDays[weekIndex][dayIndex].exercise
      : null;

    setModalData({ week: weekIndex, day: dayIndex, existingExercise }); // Almacenar el día que se quiere modificar
    setSelectedExercise(existingExercise || ''); // Preseleccionar el tipo de ejercicio existente
    setShowModal(true); // Mostrar modal para modificar
  };

  const handleSubmit = () => {
    const { week, day } = modalData;
    handleDayClick(week, day);
    setShowModal(false); // Ocultar el modal después de confirmar
  };

  return (
    <div className="tracker-container">
      <h1>Fitness Tracker</h1>

      {/* Modal para la selección o edición del ejercicio */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{modalData.existingExercise ? 'Editar ejercicio' : 'Selecciona el tipo de ejercicio'}</h2>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              <option value="">--Seleccionar--</option>
              <option value="Hombros">Hombros</option>
              <option value="Piernas">Piernas</option>
              <option value="Espalda">Espalda</option>
              <option value="Cardio">Cardio</option>
              <option value="descanso">Descanso</option>
            </select>
            <button onClick={handleSubmit}>Confirmar</button>
            <button onClick={() => setShowModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

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
                    exerciseDays[weekIndex] &&
                    exerciseDays[weekIndex][dayIndex]
                      ? exerciseDays[weekIndex][dayIndex].exercise === 'Descanso'
                        ? 'rest-day'
                        : 'active'
                      : ''
                  }`}
                  onClick={() => handleCubeClick(weekIndex, dayIndex)} // Click izquierdo para editar
                  title={
                    exerciseDays[weekIndex] &&
                    exerciseDays[weekIndex][dayIndex]
                      ? `${exerciseDays[weekIndex][dayIndex].date} "${exerciseDays[weekIndex][dayIndex].exercise}"`
                      : getDayOfWeekDate(weekIndex, dayIndex)
                  }
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
