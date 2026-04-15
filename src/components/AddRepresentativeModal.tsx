import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { RepresentanteWrite } from "../types/Representante";
import type { GenericType } from "../types/GenericType";

interface AddRepresentativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: RepresentanteWrite;
  formErrors: Partial<RepresentanteWrite>;
  submitting: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  cargos?: GenericType[];
  title?: string;
  description?: string;
}

export function AddRepresentativeModal({
  open,
  onOpenChange,
  form,
  formErrors,
  submitting,
  onChange,
  onSubmit,
  cargos = [],
  title = "Nuevo representante",
  description = "Completá los datos del representante de tu empresa.",
}: AddRepresentativeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#0F141A] text-foreground dark:text-white border-[#669649] dark:border-[#1a5032]">
        <DialogHeader>
          <DialogTitle className="text-[#143E29] dark:text-white transition-colors duration-300">
            {title}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300 transition-colors duration-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="nombre"
                className="text-[#143E29] dark:text-white transition-colors duration-300"
              >
                Nombre
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Juan"
                className={`${formErrors.nombre ? "border-red-500" : ""} dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-500 dark:focus:!border-[#68A243] transition-colors duration-300`}
                aria-invalid={!!formErrors.nombre}
              />
              {formErrors.nombre && (
                <p className="text-red-600 text-xs">{formErrors.nombre}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="apellido"
                className="text-[#143E29] dark:text-white transition-colors duration-300"
              >
                Apellido
              </Label>
              <Input
                id="apellido"
                name="apellido"
                value={form.apellido}
                onChange={onChange}
                placeholder="Pérez"
                className={`${formErrors.apellido ? "border-red-500" : ""} dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-500 dark:focus:!border-[#68A243] transition-colors duration-300`}
                aria-invalid={!!formErrors.apellido}
              />
              {formErrors.apellido && (
                <p className="text-red-600 text-xs">{formErrors.apellido}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-[#143E29] dark:text-white transition-colors duration-300"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="juan@empresa.com"
              className={`${formErrors.email ? "border-red-500" : ""} dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:placeholder-gray-500 dark:focus:!border-[#68A243] transition-colors duration-300`}
              aria-invalid={!!formErrors.email}
            />
            {formErrors.email && (
              <p className="text-red-600 text-xs">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="cargo"
              className="text-[#143E29] dark:text-white transition-colors duration-300"
            >
              Cargo
            </Label>
            <Select
              value={form.cargo === 0 ? "" : String(form.cargo)}
              onValueChange={(v) => {
                const event = {
                  target: {
                    name: "cargo",
                    value: v,
                  },
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(event);
              }}
            >
              <SelectTrigger
                className={`h-11 w-full !bg-white dark:!bg-[#0f2f25] !text-foreground dark:!text-white !border-slate-200 dark:!border-[#68A243]/20 ${
                  formErrors.cargo !== undefined && form.cargo === 0
                    ? "!border-red-500"
                    : "dark:focus-visible:!border-[#68A243]"
                }`}
              >
                <SelectValue placeholder="Seleccioná un cargo" />
              </SelectTrigger>
              <SelectContent>
                {cargos.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.cargo !== undefined && form.cargo === 0 && (
              <p className="text-red-600 text-xs">El cargo es requerido</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 dark:bg-[#0f2f25] dark:border-[#68A243]/20 dark:text-white dark:hover:bg-[#1a3f30] transition-colors duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#68A243] hover:bg-[#68A243]/90 text-white"
            >
              {submitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
