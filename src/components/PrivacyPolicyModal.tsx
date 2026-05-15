import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
}

export function PrivacyPolicyModal({
  open,
  onOpenChange,
  onAccept,
}: PrivacyPolicyModalProps) {
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
            Política de Privacidad
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
                1. Responsable del sistema
              </h3>
              <p>
                La plataforma "Ronda de Negocios Trenque Lauquen", disponible en{" "}
                <span className="font-medium">
                  rondadenegocios.trenquelauquen.gov.ar
                </span>
                , es administrada por la Municipalidad de Trenque Lauquen, a
                través de la Oficina de Empleo y la Subsecretaría de Desarrollo
                Económico y Productivo.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                2. Finalidad del sistema
              </h3>
              <p>
                La plataforma tiene como finalidad facilitar la organización y
                gestión de rondas de negocios, permitiendo: registrar empresas
                participantes, administrar eventos y turnos, coordinar reuniones
                comerciales, gestionar participación en rondas, facilitar el
                contacto entre empresas participantes, y enviar comunicaciones
                relacionadas con los eventos.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                3. Datos recopilados
              </h3>
              <p className="font-medium mb-1">Datos de empresa:</p>
              <p>
                Razón social, CUIT, dirección, provincia y localidad, sector o
                rubro, descripción institucional, logo o imagen identificatoria,
                correo electrónico, teléfono de contacto.
              </p>
              <p className="font-medium mt-3 mb-1">Datos de representantes:</p>
              <p>
                Nombre y apellido, cargo dentro de la empresa, correo
                electrónico.
              </p>
              <p className="font-medium mt-3 mb-1">
                Datos técnicos y operativos:
              </p>
              <p>
                Credenciales de acceso, historial de participación en eventos,
                turnos y reuniones agendadas, registros operativos generados por
                el sistema. Las contraseñas no se almacenan en texto plano y son
                protegidas mediante mecanismos de seguridad.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                4. Uso de la información
              </h3>
              <p>
                La información recopilada es utilizada exclusivamente para:
                validar y administrar registros, coordinar rondas de negocios,
                gestionar turnos y reuniones, identificar empresas
                participantes, facilitar la interacción entre participantes,
                enviar notificaciones y comunicaciones vinculadas a los eventos,
                y mejorar la organización del sistema.
              </p>
              <p className="mt-2">
                La Municipalidad de Trenque Lauquen no comercializa ni vende los
                datos registrados en la plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                5. Visibilidad de la información
              </h3>
              <p className="font-medium mb-1">Información pública:</p>
              <p>
                Sin necesidad de iniciar sesión, cualquier visitante podrá
                visualizar información general de eventos activos, fecha,
                horario y lugar, y listado de empresas que hayan confirmado
                participación. En estos casos no se mostrarán datos de contacto.
              </p>
              <p className="font-medium mt-3 mb-1">
                Información visible para empresas participantes:
              </p>
              <p>
                Las empresas participantes que hayan iniciado sesión podrán
                visualizar de otras empresas participantes: nombre, logo,
                descripción, correo electrónico y teléfono de contacto. Esta
                visibilidad tiene como finalidad facilitar el contacto comercial
                entre participantes.
              </p>
              <p className="font-medium mt-3 mb-1">Información de reuniones:</p>
              <p>
                Cuando una empresa ocupa una mesa disponible como anfitriona, su
                participación podrá ser visible para otras empresas
                participantes mientras la mesa permanezca abierta. Una vez
                completada la mesa, la información de dicha reunión solo será
                visible para las empresas involucradas y los administradores.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                6. Correos electrónicos y comunicaciones
              </h3>
              <p>
                La plataforma podrá enviar correos electrónicos relacionados
                con: validación de cuenta, aprobación de empresas, confirmación
                de participación, asignación o cancelación de reuniones,
                recordatorios de eventos, y comunicaciones institucionales
                vinculadas a rondas de negocios.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                7. Seguridad de la información
              </h3>
              <p>
                La Municipalidad de Trenque Lauquen adopta medidas técnicas
                razonables para proteger la información almacenada y restringir
                accesos no autorizados. La plataforma utiliza conexiones seguras
                mediante HTTPS y mecanismos de autenticación para el acceso de
                usuarios registrados.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                8. Almacenamiento y conservación
              </h3>
              <p>
                La información registrada podrá conservarse con fines
                administrativos, históricos y organizativos vinculados a las
                rondas de negocios realizadas. Determinados registros podrán
                mantenerse aun cuando una empresa deje de participar en futuros
                eventos.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                9. Derechos de los usuarios
              </h3>
              <p>
                Las empresas registradas podrán solicitar: actualización de
                información, corrección de datos, y consultas sobre la
                información almacenada. Las solicitudes deberán realizarse a
                través de los canales oficiales de contacto de la Municipalidad
                de Trenque Lauquen.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                10. Cookies y sesión
              </h3>
              <p>
                La plataforma utiliza cookies técnicas necesarias para mantener
                la sesión iniciada y permitir el funcionamiento del sistema. No
                se utilizan herramientas de publicidad, marketing ni seguimiento
                comercial de usuarios.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                11. Modificaciones
              </h3>
              <p>
                La Municipalidad de Trenque Lauquen podrá actualizar la presente
                Política de Privacidad cuando resulte necesario. La versión
                vigente será siempre la publicada en la plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                12. Contacto
              </h3>
              <p>
                Para consultas relacionadas con esta Política de Privacidad o el
                funcionamiento de la plataforma, podrá contactarse a través de
                los canales oficiales de la Municipalidad de Trenque Lauquen.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143E29] dark:text-white mb-1">
                13. Aceptación de los términos
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
