import Navbar from "../components/Navbar";
const Test = () => {
  return (
    /* Cambiamos h-screen por min-h-[150vh] para forzar el scroll */
    <div className="min-h-[150vh] w-full bg-primary">
      <Navbar />
      <div className="p-10 text-white text-4xl">
        Ahora sí debería haber scroll... Prueba a abrir un modal o dropdown
        aquí.
      </div>
    </div>
  );
};

export default Test;
