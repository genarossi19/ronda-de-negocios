import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface TermsAndConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

export function TermsAndConditionsModal({
  open,
  onOpenChange,
  onAccept,
}: TermsAndConditionsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setHasScrolledToBottom(false);
    }
  }, [open]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 16;
    if (atBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    onAccept?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-[#0f2f25] dark:border-[#68A243]/20">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#143E29] dark:text-white">
            Términos y Condiciones de Uso
          </DialogTitle>
          <p className="text-xs text-muted-foreground dark:text-gray-400">
            Ronda de Negocios Trenque Lauquen — Última actualización: 15 de mayo
            de 2026
          </p>
        </DialogHeader>

        <div
          ref={scrollViewportRef}
          onScroll={handleScroll}
          className="h-[52vh] overflow-y-auto rounded-md border border-slate-200 dark:border-[#68A243]/15 px-4 py-4"
        >
          <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                1. Aceptación de los términos
              </h3>
              <p>
                El acceso y uso de la plataforma "Ronda de Negocios Trenque
                Lauquen", disponible en{" "}
                <span className="font-medium">
                  rondadenegocios.trenquelauquen.gov.ar
                </span>
                , implica la aceptación de los presentes Términos y Condiciones
                por parte de la empresa usuaria y sus representantes. Si no está
                de acuerdo con estos términos, no deberá utilizar la plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                2. Objeto de la plataforma
              </h3>
              <p>
                La plataforma tiene como finalidad facilitar la organización y
                gestión de rondas de negocios promovidas por la Municipalidad de
                Trenque Lauquen, permitiendo: registrar empresas participantes,
                administrar eventos, gestionar reuniones y turnos, y facilitar
                el contacto entre empresas participantes.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                3. Registro de empresas
              </h3>
              <p>
                Para participar en las rondas de negocios, las empresas deberán
                completar el proceso de registro proporcionando información
                válida, actualizada y verificable.
              </p>
              <p className="mt-2">
                La Municipalidad de Trenque Lauquen podrá: aprobar o rechazar
                solicitudes de registro, solicitar información adicional,
                suspender o eliminar registros que contengan información falsa,
                incompleta o inconsistente.
              </p>
              <p className="mt-2">
                Cada empresa será responsable de: la veracidad de los datos
                ingresados, la confidencialidad de sus credenciales de acceso, y
                las acciones realizadas desde su cuenta.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                4. Participación en eventos y reuniones
              </h3>
              <p>
                La inscripción en la plataforma no garantiza automáticamente la
                participación en un evento. La participación efectiva dependerá
                de la aprobación administrativa y la confirmación de asistencia
                al evento correspondiente.
              </p>
              <p className="mt-2">
                Las empresas participantes podrán: reservar turnos, ocupar mesas
                disponibles, y participar como anfitrionas o invitadas según la
                dinámica establecida por el sistema.
              </p>
              <p className="mt-2">
                La Municipalidad de Trenque Lauquen podrá modificar, reorganizar
                o cancelar turnos y eventos cuando razones organizativas o
                técnicas lo requieran.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                5. Uso adecuado del sistema
              </h3>
              <p>
                Las empresas usuarias se comprometen a utilizar la plataforma de
                manera responsable y exclusivamente para fines vinculados a las
                rondas de negocios. No se encuentra permitido: utilizar
                información de otras empresas para fines ajenos al evento,
                realizar actividades fraudulentas o engañosas, interferir con el
                funcionamiento del sistema, intentar acceder a información o
                funcionalidades no autorizadas, ni suplantar identidad de
                terceros.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                6. Información visible entre participantes
              </h3>
              <p>
                Las empresas participantes comprenden y aceptan que determinados
                datos de contacto e información institucional podrán ser
                visibles para otras empresas participantes con el objetivo de
                facilitar el vínculo comercial dentro de la ronda de negocios.
                La información visible se encuentra regulada por la Política de
                Privacidad de la plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                7. Comunicaciones electrónicas
              </h3>
              <p>
                La plataforma podrá enviar correos electrónicos relacionados
                con: validación de cuenta, aprobación de empresas, confirmación
                de participación, recordatorios de eventos, asignación o
                cancelación de reuniones, y comunicaciones organizativas
                vinculadas a las rondas de negocios. El uso de la plataforma
                implica la aceptación de dichas comunicaciones operativas.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                8. Disponibilidad del servicio
              </h3>
              <p>
                La Municipalidad de Trenque Lauquen realizará esfuerzos
                razonables para mantener el funcionamiento de la plataforma,
                aunque no garantiza disponibilidad permanente ni ausencia
                absoluta de errores técnicos. Podrán realizarse tareas de
                mantenimiento, actualizaciones o interrupciones temporales
                cuando resulte necesario.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                9. Responsabilidad
              </h3>
              <p>
                La Municipalidad de Trenque Lauquen actúa como organizadora y
                administradora de la plataforma, pero no garantiza: resultados
                comerciales, acuerdos entre empresas, concreción de negocios, ni
                continuidad de vínculos comerciales generados entre
                participantes. Cada empresa será responsable de las decisiones
                comerciales que adopte en el marco de las rondas de negocios.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                10. Protección de datos
              </h3>
              <p>
                El tratamiento de los datos personales e institucionales se
                encuentra regulado por la Política de Privacidad vigente de la
                plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                11. Modificaciones
              </h3>
              <p>
                La Municipalidad de Trenque Lauquen podrá actualizar los
                presentes Términos y Condiciones cuando resulte necesario. La
                versión vigente será la publicada en la plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                12. Aceptación de los términos
              </h3>
              <p>
                El acceso, registro y uso de la plataforma "Ronda de Negocios
                Trenque Lauquen", disponible en{" "}
                <span className="font-medium">
                  rondadenegocios.trenquelauquen.gov.ar
                </span>
                , implica la lectura, comprensión y aceptación de los presentes
                Términos y Condiciones y de la Política de Privacidad vigente.
              </p>
              <p className="mt-2">
                Al registrarse y utilizar la plataforma, la empresa usuaria y
                sus representantes aceptan las condiciones de funcionamiento,
                participación y tratamiento de información descriptas en dichos
                documentos.
              </p>
              <p className="mt-2">
                Si no está de acuerdo con estos términos, no deberá registrarse
                ni utilizar la plataforma.
              </p>
            </section>
          </div>
        </div>

        {!hasScrolledToBottom && (
          <p className="text-xs text-center text-muted-foreground dark:text-gray-400">
            Desplazate hasta el final para habilitar el botón de aceptar
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="dark:text-gray-300 dark:hover:bg-[#143E29]"
          >
            Cerrar
          </Button>
          {onAccept && (
            <Button
              disabled={!hasScrolledToBottom}
              onClick={handleAccept}
              className="bg-[#68A243] hover:bg-[#5a9038] text-white disabled:opacity-40"
            >
              Aceptar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
