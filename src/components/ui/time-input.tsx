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

export function TimeInput({
  id,
  value,
  onChange,
  className,
  disabled,
  "aria-invalid": ariaInvalid,
}: TimeInputProps) {
  const [hh, setHh] = useState("");
  const [mm, setMm] = useState("");
  const mmRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const [h = "", m = ""] = value.split(":");
      setHh(h);
      setMm(m);
    } else {
      setHh("");
      setMm("");
    }
  }, [value]);

  const tryEmit = (h: string, m: string) => {
    const hNum = parseInt(h, 10);
    const mNum = parseInt(m, 10);
    if (
      h.length > 0 &&
      m.length > 0 &&
      !Number.isNaN(hNum) &&
      !Number.isNaN(mNum) &&
      hNum >= 0 &&
      hNum <= 23 &&
      mNum >= 0 &&
      mNum <= 59
    ) {
      onChange(
        `${hNum.toString().padStart(2, "0")}:${mNum.toString().padStart(2, "0")}`,
      );
    }
  };

  // --- Horas ---
  const handleHhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setHh(raw);
    // Auto-avanzar: dígito único 3-9 (imposible que sea decena válida) o dos dígitos
    if (raw.length === 2 || (raw.length === 1 && parseInt(raw, 10) >= 3)) {
      mmRef.current?.focus();
      mmRef.current?.select();
    }
    tryEmit(raw, mm);
  };

  const handleHhBlur = () => {
    if (!hh) return;
    const h = parseInt(hh, 10);
    if (!Number.isNaN(h) && h >= 0 && h <= 23) {
      const fmt = h.toString().padStart(2, "0");
      setHh(fmt);
      tryEmit(fmt, mm);
    }
  };

  const handleHhKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next =
        e.key === "ArrowUp"
          ? (parseInt(hh || "0", 10) + 1) % 24
          : (parseInt(hh || "0", 10) - 1 + 24) % 24;
      const fmt = next.toString().padStart(2, "0");
      setHh(fmt);
      tryEmit(fmt, mm);
    } else if (e.key === ":") {
      e.preventDefault();
      mmRef.current?.focus();
      mmRef.current?.select();
    }
  };

  // --- Minutos ---
  const handleMmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMm(raw);
    tryEmit(hh, raw);
  };

  const handleMmBlur = () => {
    if (!mm) return;
    const m = parseInt(mm, 10);
    if (!Number.isNaN(m) && m >= 0 && m <= 59) {
      const fmt = m.toString().padStart(2, "0");
      setMm(fmt);
      tryEmit(hh, fmt);
    }
  };

  const handleMmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next =
        e.key === "ArrowUp"
          ? (parseInt(mm || "0", 10) + 1) % 60
          : (parseInt(mm || "0", 10) - 1 + 60) % 60;
      const fmt = next.toString().padStart(2, "0");
      setMm(fmt);
      tryEmit(hh, fmt);
    }
  };

  const segmentClass =
    "w-7 bg-transparent border-0 p-0 text-center outline-none ring-0 text-sm tabular-nums placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed";

  return (
    <div
      className={cn(
        "flex h-9 w-full items-center rounded-lg border px-3 py-2 text-sm transition-colors",
        "focus-within:ring-2",
        ariaInvalid
          ? "focus-within:border-red-500 focus-within:ring-red-500/20"
          : "focus-within:border-[#68A243] focus-within:ring-[#68A243]/20",
        className,
      )}
      aria-invalid={ariaInvalid}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        maxLength={2}
        placeholder="HH"
        value={hh}
        onChange={handleHhChange}
        onBlur={handleHhBlur}
        onKeyDown={handleHhKeyDown}
        disabled={disabled}
        className={segmentClass}
      />
      <span className="select-none text-muted-foreground">:</span>
      <input
        ref={mmRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        placeholder="MM"
        value={mm}
        onChange={handleMmChange}
        onBlur={handleMmBlur}
        onKeyDown={handleMmKeyDown}
        disabled={disabled}
        className={segmentClass}
      />
    </div>
  );
}
