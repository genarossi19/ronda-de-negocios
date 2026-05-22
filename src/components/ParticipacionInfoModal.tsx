import { useState } from "react";
import { motion as m, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  TableProperties,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

interface ParticipacionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Mock: CompanyCard (replica real) ────────────────────────────────────────

function MockCompanyCard({ showContact }: { showContact: boolean }) {
  return (
    <div className="cursor-pointer rounded-xl shadow-sm border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] transition-all duration-300 p-4 max-w-[220px] mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-xl flex items-center justify-center overflow-hidden mb-3 bg-[#68A243]/20 dark:bg-[#68A243]/35">
          <span className="text-3xl font-bold tracking-wide text-[#143E29] dark:text-[#d7efc8]">
            MA
          </span>
        </div>
        <h3 className="font-semibold text-lg text-[#143E29] dark:text-white">
          Mi Empresa S.A.
        </h3>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#68A243]/10 dark:bg-[#68A243]/20 text-[#143E29] dark:text-[#68A243] text-sm font-medium mt-1">
          <Building2 className="h-3 w-3" />
          Tecnología
        </div>
      </div>
    </div>
  );
}

// ─── Mock: CompanyModal contact section ───────────────────────────────────────

function MockContactSection({ showContact }: { showContact: boolean }) {
  return (
    <div className="border border-gray-200 dark:border-[#68A243]/20 rounded-xl bg-white dark:bg-[#0F141A] p-4 max-w-[320px] mx-auto">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#143E29] dark:text-white">
            <FileText className="h-4 w-4 text-[#68A243]" />
            <span className="font-semibold text-sm">Descripción</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">
            Empresa de desarrollo de software y soluciones tecnológicas para el
            agro.
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#143E29] dark:text-white">
            <MapPin className="h-4 w-4 text-[#68A243]" />
            <span className="font-semibold text-sm">Ubicación</span>
          </div>
          <div className="pl-6 space-y-0.5">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Provincia:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Buenos Aires
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Localidad:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Trenque Lauquen
              </span>
            </p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {showContact ? (
            <m.div
              key="contact"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1.5 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-[#143E29] dark:text-white">
                <Phone className="h-4 w-4 text-[#68A243]" />
                <span className="font-semibold text-sm">Contacto</span>
              </div>
              <div className="pl-6 space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    (02392) 123-456
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    empresa@email.com
                  </span>
                </div>
              </div>
            </m.div>
          ) : (
            <m.div
              key="locked"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-gray-100 dark:border-[#68A243]/15">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Para ver información de contacto completa, por favor{" "}
                  <span className="text-[#68A243] font-medium">
                    inicia sesión
                  </span>
                </p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Mock: Shift card (replica real) ─────────────────────────────────────────

function MockShiftCard({
  hora,
  estado,
  mesasTotal,
  mesasOcupadas,
}: {
  hora: string;
  estado: "abierto" | "full" | "cerrado";
  mesasTotal: number;
  mesasOcupadas: number;
}) {
  const pct = Math.round((mesasOcupadas / mesasTotal) * 100);
  const statusBadge =
    estado === "abierto" ? (
      <Badge className="bg-[#68A243] hover:bg-[#68A243]/90 text-white text-xs">
        Disponible
      </Badge>
    ) : estado === "full" ? (
      <Badge variant="destructive" className="text-xs">
        Completo
      </Badge>
    ) : (
      <Badge className="bg-gray-400 text-gray-800 text-xs">Cerrado</Badge>
    );

  return (
    <div className="rounded-xl border-2 border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[#68A243]/10 dark:bg-[#68A243]/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-[#68A243]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Horario
              </p>
              <p className="font-bold text-[#143E29] dark:text-white">{hora}</p>
            </div>
          </div>
        </div>
        {statusBadge}
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-[#68A243]/10 dark:bg-[#68A243]/20 flex items-center justify-center">
          <Users className="h-4 w-4 text-[#68A243]" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mesas disponibles
          </p>
          <p className="font-bold text-[#143E29] dark:text-white">
            {mesasTotal - mesasOcupadas} de {mesasTotal}
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Ocupación</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-[#0f2f25] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#68A243] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        disabled={estado !== "abierto"}
        className="w-full h-10 rounded-md bg-[#68A243] hover:bg-[#5a9038] disabled:bg-gray-200 dark:disabled:bg-[#0f2f25] disabled:text-gray-400 text-white text-sm font-semibold transition-colors duration-200"
      >
        {estado === "abierto"
          ? "Ver Mesas Disponibles"
          : "Sin mesas disponibles"}
      </button>
    </div>
  );
}

// ─── Mock: MeetingCard (replica real) ────────────────────────────────────────

function MockMeetingCard({
  hora_inicio,
  hora_fin,
  num_mesa,
  isAnf,
  empresa_otra,
  rep_nombre,
  rep_email,
  estado,
}: {
  hora_inicio: string;
  hora_fin: string;
  num_mesa: number;
  isAnf: boolean;
  empresa_otra: string;
  rep_nombre: string;
  rep_email: string;
  estado: "reservado" | "pendiente";
}) {
  const rolCls = isAnf
    ? "bg-[#143E29] text-white dark:bg-[#1a5032] border-0"
    : "bg-[#68A243]/15 text-[#143E29] dark:bg-[#68A243]/20 dark:text-[#b8e39c] border-0";
  const estadoCls =
    estado === "reservado"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/40 text-xs"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/40 text-xs";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-[#68A243]/20 dark:bg-[#143E29] hover:shadow-md transition-shadow duration-200 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#68A243]" />
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {hora_inicio} – {hora_fin}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <TableProperties className="h-3.5 w-3.5" />
            Mesa {num_mesa}
          </span>
          <Badge className={`text-xs font-medium ${rolCls}`}>
            {isAnf ? "Anfitriona" : "Invitada"}
          </Badge>
        </div>
      </div>
      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Reunión con
      </p>
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-[#68A243]" />
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          {empresa_otra}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {rep_nombre}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {rep_email}
        </span>
      </div>
      <div className="pt-2 border-t border-gray-100 dark:border-[#68A243]/15">
        <Badge className={estadoCls}>
          {estado === "reservado" ? "Reservado" : "Pendiente"}
        </Badge>
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: "Directorio" },
  { id: 1, label: "Turnos" },
  { id: 2, label: "Reuniones" },
  { id: 3, label: "El evento" },
];

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

export default function ParticipacionInfoModal({
  isOpen,
  onClose,
}: ParticipacionInfoModalProps) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [showContact, setShowContact] = useState(false);

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handleClose = () => {
    setStep(0);
    setDir(1);
    setShowContact(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!w-[min(95vw,540px)] !max-w-none !p-0 !gap-0 !rounded-2xl !border-gray-200 dark:!border-[#68A243]/20 !bg-white dark:!bg-[#11161d] !overflow-hidden !h-[min(92vh,660px)] flex flex-col">
        {/* Header gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#143E29] via-[#1a5032] to-[#0f2f25] px-5 pt-5 pb-6 flex-shrink-0">
          <m.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9FD27B] mb-1">
              {STEPS[step].label}
            </p>
            <DialogTitle className="text-xl font-bold text-white leading-snug">
              {step === 0 && "Tu empresa aparece en el directorio público"}
              {step === 1 && "Elegís tus turnos y reservás mesas"}
              {step === 2 && "Ves el historial de tus reuniones"}
              {step === 3 && "El evento: todo en un lugar"}
            </DialogTitle>
            <p className="text-xs text-white/65 mt-1.5 leading-relaxed">
              {step === 0 &&
                "Así se ve tu empresa para otros usuarios. Probá los dos modos."}
              {step === 1 &&
                "Lista de turnos con horario, ocupación y estado en tiempo real."}
              {step === 2 &&
                "Registro de cada reunión: empresa, representante y datos de contacto."}
              {step === 3 &&
                "Ronda de Negocios · Trenque Lauquen · Edición 2026"}
            </p>
          </m.div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence custom={dir} mode="wait">
            <m.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto px-5 py-5"
            >
              {/* STEP 0: Directorio */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-gray-100 dark:bg-[#1a2a20] w-fit mx-auto">
                    <button
                      onClick={() => setShowContact(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        !showContact
                          ? "bg-white dark:bg-[#143E29] shadow-sm text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <Globe className="h-3 w-3" />
                      Vista pública
                    </button>
                    <button
                      onClick={() => setShowContact(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                        showContact
                          ? "bg-white dark:bg-[#143E29] shadow-sm text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                      }`}
                    >
                      <Mail className="h-3 w-3" />
                      Empresas registradas
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-start">
                    <MockCompanyCard showContact={showContact} />
                    <MockContactSection showContact={showContact} />
                  </div>

                  <m.div
                    key={showContact ? "show" : "hide"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                      showContact
                        ? "border-[#68A243]/25 bg-[#68A243]/5 dark:bg-[#68A243]/10 text-[#3F6E20] dark:text-[#9FD27B]"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {showContact ? (
                      <>
                        <Mail className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          Las empresas registradas ven el teléfono y email para
                          facilitar la comunicación antes y después del evento.
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          Los visitantes sin cuenta solo ven nombre, rubro y
                          ciudad. Tu información de contacto está protegida.
                        </span>
                      </>
                    )}
                  </m.div>
                </div>
              )}

              {/* STEP 1: Turnos */}
              {step === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#68A243]" />
                      <span className="text-sm font-semibold text-[#143E29] dark:text-white">
                        Turnos disponibles
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Ronda 2026
                    </span>
                  </div>
                  <MockShiftCard
                    hora="09:00 – 09:20 hs"
                    estado="abierto"
                    mesasTotal={8}
                    mesasOcupadas={3}
                  />
                  <MockShiftCard
                    hora="09:30 – 09:50 hs"
                    estado="full"
                    mesasTotal={8}
                    mesasOcupadas={8}
                  />
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                    Podés inscribirte en los turnos que estén disponibles y
                    elegir tu mesa.
                  </p>
                </div>
              )}

              {/* STEP 2: Reuniones */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#143E29] dark:text-white">
                      Mis reuniones
                    </span>
                    <Badge className="text-xs bg-[#68A243]/10 text-[#3F6E20] border-[#68A243]/20 dark:bg-[#68A243]/20 dark:text-[#9FD27B] dark:border-[#68A243]/30">
                      2 reuniones
                    </Badge>
                  </div>
                  <MockMeetingCard
                    hora_inicio="09:00"
                    hora_fin="09:20"
                    num_mesa={3}
                    isAnf={true}
                    empresa_otra="Empresa Beta S.R.L."
                    rep_nombre="Carlos García"
                    rep_email="carlos@beta.com"
                    estado="reservado"
                  />
                  <MockMeetingCard
                    hora_inicio="09:30"
                    hora_fin="09:50"
                    num_mesa={7}
                    isAnf={false}
                    empresa_otra="Grupo Constructor S.A."
                    rep_nombre="Laura Méndez"
                    rep_email="laura@constructor.com"
                    estado="pendiente"
                  />
                </div>
              )}

              {/* STEP 3: El evento */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-br from-[#143E29] to-[#1a5032] p-5 text-white">
                    <p className="font-bold text-base mb-1">
                      2da Ronda de Negocios
                    </p>
                    <p className="text-white/70 text-xs mb-4">
                      Trenque Lauquen · 2026
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          icon: Users,
                          label: "Empresas locales participantes",
                        },
                        { icon: Clock, label: "Reuniones de 20 min por turno" },
                        {
                          icon: MapPin,
                          label: "Evento presencial en la ciudad",
                        },
                      ].map(({ icon: Icon, label }, i) => (
                        <div
                          key={i}
                          className="text-center rounded-lg bg-white/10 p-3"
                        >
                          <Icon className="h-5 w-5 mx-auto mb-1.5 text-[#9FD27B]" />
                          <p className="text-[10px] text-white/80 leading-tight">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      "Confirmás tu asistencia al evento presencial",
                      "Tu empresa aparece en la lista de participantes",
                      "Podés inscribirte en los turnos y elegir tus mesas",
                      "Accedés al historial de reuniones con datos de contacto",
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#68A243] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </m.div>
          </AnimatePresence>
        </div>

        {/* Footer fixed */}
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-[#68A243]/15 px-5 py-3 flex items-center justify-between bg-white dark:bg-[#11161d]">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => goTo(s.id)}
                className={`rounded-full transition-all duration-200 ${
                  s.id === step
                    ? "w-5 h-2 bg-[#68A243]"
                    : "w-2 h-2 bg-gray-200 dark:bg-[#68A243]/25 hover:bg-[#68A243]/50"
                }`}
                aria-label={`Ir al paso ${s.id + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#68A243]/20 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#143E29] transition-colors duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => goTo(step + 1)}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#68A243] hover:bg-[#5a9038] text-white text-sm font-semibold transition-colors duration-200"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#68A243] hover:bg-[#5a9038] text-white text-sm font-semibold transition-colors duration-200"
              >
                <CheckCircle2 className="h-4 w-4" />
                Entendido
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
