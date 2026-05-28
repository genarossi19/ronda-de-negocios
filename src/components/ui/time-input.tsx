import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface TimeInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

// Construye el string de display a partir de 0-4 dígitos.
// Ejemplos:
//   ""     → ""          (muestra placeholder)
//   "1"    → "1"
//   "19"   → "19:"       (el : aparece al completar los 2 dígitos de hora)
//   "193"  → "19:3"
//   "1930" → "19:30"
function buildDisplay(digits: string): string {
  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;
  if (digits.length === 2) return `${digits}:`;
  if (digits.length === 3) return `${digits.slice(0, 2)}:${digits[2]}`;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function TimeInput({
  id,
  value,
  onChange,
  className,
  disabled,
  "aria-invalid": ariaInvalid,
}: TimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // digits: hasta 4 caracteres numéricos, sin el ":"
  const [digits, setDigits] = useState("");
  // Si hay un valor cargado y el usuario empieza a escribir, limpia primero
  const pendingClear = useRef(false);

  // Sincronizar valor externo → dígitos internos
  useEffect(() => {
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      setDigits(value.replace(":", ""));
    } else {
      setDigits("");
    }
  }, [value]);

  const emitIfComplete = (d: string) => {
    if (d.length === 4) {
      const h = parseInt(d.slice(0, 2), 10);
      const m = parseInt(d.slice(2, 4), 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange(`${d.slice(0, 2)}:${d.slice(2, 4)}`);
        return;
      }
    }
    if (d.length === 0) {
      onChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();

      // Si el usuario empieza a escribir con un valor previo cargado, lo borra primero
      const base = pendingClear.current ? "" : digits;
      pendingClear.current = false;

      if (base.length >= 4) return;

      const digit = e.key;
      let next = base + digit;

      // Primer dígito de hora > 2: imposible en 24h → auto-completar como "0X"
      // Ej: teclear "8" → next = "08", display pasa a "08:" de inmediato
      if (next.length === 1 && parseInt(digit, 10) > 2) {
        next = "0" + digit;
      }

      // Segundo dígito de hora: valida que HH <= 23
      if (next.length === 2) {
        const h = parseInt(next, 10);
        if (h > 23) return;
      }

      // Primer dígito de minutos: no puede ser > 5 en formato MM
      if (next.length === 3 && parseInt(digit, 10) > 5) return;

      // Segundo dígito de minutos: valida que MM <= 59
      if (next.length === 4) {
        const m = parseInt(next.slice(2), 10);
        if (m > 59) return;
      }

      setDigits(next);
      emitIfComplete(next);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      pendingClear.current = false;
      const next = digits.slice(0, -1);
      setDigits(next);
      if (next.length === 0) onChange("");
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      pendingClear.current = false;
      if (digits.length < 4) return;
      const h = parseInt(digits.slice(0, 2), 10);
      const m = parseInt(digits.slice(2, 4), 10);
      let newH = h;
      let newM = m;
      if (e.key === "ArrowUp") {
        newM = (m + 1) % 60;
        if (newM === 0) newH = (h + 1) % 24;
      } else {
        newM = (m - 1 + 60) % 60;
        if (newM === 59) newH = (h - 1 + 24) % 24;
      }
      const hStr = newH.toString().padStart(2, "0");
      const mStr = newM.toString().padStart(2, "0");
      setDigits(hStr + mStr);
      onChange(`${hStr}:${mStr}`);
    }
  };

  const handleFocus = () => {
    // Si al hacer foco ya hay un valor, el próximo dígito lo reemplaza
    if (digits.length > 0) {
      pendingClear.current = true;
    }
  };

  const handleBlur = () => {
    pendingClear.current = false;

    // Completar con ceros a la derecha hasta 4 dígitos, o forzar "00:00" si vacío
    const raw = digits.length === 0 ? "0000" : digits.padEnd(4, "0");
    if (raw === digits && digits.length === 4) return; // ya completo, nada que hacer

    const h = parseInt(raw.slice(0, 2), 10);
    const m = parseInt(raw.slice(2, 4), 10);
    if (h <= 23 && m <= 59) {
      setDigits(raw);
      onChange(`${raw.slice(0, 2)}:${raw.slice(2, 4)}`);
    }
  };

  return (
    <div
      className={cn(
        "flex h-9 w-full items-center rounded-lg border px-3 py-2 text-sm transition-colors cursor-text",
        "focus-within:ring-2",
        ariaInvalid
          ? "focus-within:border-red-500 focus-within:ring-red-500/20"
          : "focus-within:border-[#68A243] focus-within:ring-[#68A243]/20",
        className,
      )}
      aria-invalid={ariaInvalid}
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="numeric"
        readOnly
        value={buildDisplay(digits)}
        placeholder="HH:MM"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className="w-full bg-transparent border-0 p-0 outline-none ring-0 text-sm tabular-nums placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
      />
    </div>
  );
}
