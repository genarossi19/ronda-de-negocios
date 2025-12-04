import { useState, useEffect } from "react";

import { getTurnoByEventoId } from "../api/TurnoService";
import type { TurnoResponse } from "../types/Turno";
const Test = () => {
  const [turno, setTurno] = useState<TurnoResponse[]>([]);

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const data = await getTurnoByEventoId(2);
        console.log(data);
        setTurno(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTurno();
  }, []);

  return (
    <ul>
      <h1>Turnos</h1>
      {turno.length > 0 ? (
        turno.map((turno) => <li key={turno.id}>{turno.hora_inicio}</li>)
      ) : (
        <p>No hay turnos en ese evento</p>
      )}
    </ul>
  );
};

export default Test;
