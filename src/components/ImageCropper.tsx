import React, { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  X,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Edit,
  Check,
} from "lucide-react";

interface ImageCropperProps {
  onCropComplete?: (croppedImage: Blob) => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
}

interface CropState {
  x: number;
  y: number;
  zoom: number;
}

type EditorMode = "upload" | "crop" | "preview";

export default function ImageCropper({
  onCropComplete,
  maxFileSize = 5,
  acceptedFormats = ["image/png", "image/jpeg", "image/webp"],
}: ImageCropperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [cropState, setCropState] = useState<CropState>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [savedEditState, setSavedEditState] = useState<CropState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<EditorMode>("upload");

  const CROP_SIZE = 280;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.1;

  // === EFFECT: Actualizar imagen del preview cuando croppedPreview cambia ===
  useEffect(() => {
    if (previewImageRef.current && croppedPreview) {
      console.log(
        "[ImageCropper] useEffect: Actualizando src de preview imagen",
      );
      previewImageRef.current.src = croppedPreview;
      console.log("[ImageCropper] useEffect: src actualizado");
    }
  }, [croppedPreview]);

  // === HANDLERS ===

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!acceptedFormats.includes(file.type)) {
      setError("Formato no soportado. Usa PNG, JPG o WebP.");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setError(`El archivo no debe exceder ${maxFileSize}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
      setCropState({ x: 0, y: 0, zoom: 1 });
      setMode("crop");
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageSrc || mode !== "crop") return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropState.x,
      y: e.clientY - cropState.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !imageSrc) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setCropState((prev) => ({
      ...prev,
      x: newX,
      y: newY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction: "in" | "out") => {
    setCropState((prev) => {
      let newZoom = prev.zoom;
      if (direction === "in") {
        newZoom = Math.min(prev.zoom + ZOOM_STEP, MAX_ZOOM);
      } else {
        newZoom = Math.max(prev.zoom - ZOOM_STEP, MIN_ZOOM);
      }
      return { ...prev, zoom: newZoom };
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!imageSrc || mode !== "crop") return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? "in" : "out";
    handleZoom(direction);
  };

  const handleCrop = async () => {
    if (!imageSrc || !imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);
    console.log("[ImageCropper] handleCrop iniciado");

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context no disponible");

      if (CROP_SIZE <= 0) {
        throw new Error("Dimensiones de canvas inválidas");
      }

      canvas.width = CROP_SIZE;
      canvas.height = CROP_SIZE;
      console.log(
        "[ImageCropper] Canvas dimensiones:",
        canvas.width,
        "x",
        canvas.height,
      );

      const image = new Image();

      image.onerror = () => {
        console.error("[ImageCropper] Error al cargar imagen");
        setError("Error al cargar la imagen");
        setIsProcessing(false);
      };

      image.onload = () => {
        console.log(
          "[ImageCropper] Imagen cargada:",
          image.width,
          "x",
          image.height,
        );

        try {
          if (image.width <= 0 || image.height <= 0) {
            throw new Error("Imagen con dimensiones inválidas");
          }

          const sourceX = Math.max(
            0,
            Math.min(
              -cropState.x / cropState.zoom,
              image.width - CROP_SIZE / cropState.zoom,
            ),
          );
          const sourceY = Math.max(
            0,
            Math.min(
              -cropState.y / cropState.zoom,
              image.height - CROP_SIZE / cropState.zoom,
            ),
          );
          const sourceWidth = Math.max(
            1,
            Math.min(CROP_SIZE / cropState.zoom, image.width - sourceX),
          );
          const sourceHeight = Math.max(
            1,
            Math.min(CROP_SIZE / cropState.zoom, image.height - sourceY),
          );

          console.log("[ImageCropper] Crop geometry:", {
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            destinationX: 0,
            destinationY: 0,
            destinationWidth: CROP_SIZE,
            destinationHeight: CROP_SIZE,
          });

          ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

          ctx.drawImage(
            image,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            CROP_SIZE,
            CROP_SIZE,
          );
          console.log("[ImageCropper] drawImage ejecutado");

          // Guardar estado de edición para re-editar después
          setSavedEditState({ ...cropState });

          // Convertir canvas a blob DIRECTAMENTE - NO usar toDataURL
          canvas.toBlob(
            (blob) => {
              console.log(
                "[ImageCropper] toBlob callback, blob size:",
                blob?.size,
              );
              if (blob) {
                try {
                  // Crear URL del blob (más eficiente que data URL)
                  const blobUrl = URL.createObjectURL(blob);
                  console.log(
                    "[ImageCropper] Blob URL creado:",
                    blobUrl.substring(0, 50) + "...",
                  );

                  // Guardar el blob URL como preview
                  setCroppedPreview(blobUrl);
                  console.log(
                    "[ImageCropper] CroppedPreview estado actualizado con blob URL",
                  );

                  // Callback para upload
                  onCropComplete?.(blob);
                  console.log("[ImageCropper] onCropComplete ejecutado");
                } catch (err) {
                  console.error(
                    "[ImageCropper] Error en toBlob callback:",
                    err,
                  );
                }
              } else {
                console.warn("[ImageCropper] toBlob retornó null");
              }
              // SIEMPRE ir a preview una vez que el blob se procesó
              setMode("preview");
              console.log("[ImageCropper] Mode cambiado a preview");
              setIsProcessing(false);
            },
            "image/png",
            0.95,
          );

          // Fallback por timeout: si toBlob tarda demasiado, proceder de todas formas
          setTimeout(() => {
            console.warn(
              "[ImageCropper] toBlob timeout fallback - blob generation taking too long",
            );
            setMode("preview");
            setIsProcessing(false);
          }, 7000);
        } catch (err) {
          console.error("[ImageCropper] Error en image.onload:", err);
          setError("Error al procesar el recorte");
          setIsProcessing(false);
        }
      };

      image.src = imageSrc;

      // Timeout para carga de imagen
      setTimeout(() => {
        if (image.src === imageSrc && !image.complete) {
          console.error("[ImageCropper] Timeout al cargar imagen");
          setError("Timeout al cargar imagen");
          setIsProcessing(false);
        }
      }, 5000);
    } catch (err) {
      console.error("Error en handleCrop:", err);
      setError("Error al procesar la imagen");
      setIsProcessing(false);
    }
  };

  const handleEditAgain = () => {
    setMode("crop");
    // Restaurar el estado de edición previo en lugar de resetear
    if (savedEditState) {
      setCropState(savedEditState);
    } else {
      setCropState({ x: 0, y: 0, zoom: 1 });
    }
  };

  const handleChangeImage = () => {
    setImageSrc(null);
    setCroppedPreview(null);
    setCropState({ x: 0, y: 0, zoom: 1 });
    setSavedEditState(null);
    setError(null);
    setMode("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // === RENDER: UPLOAD MODE ===
  if (mode === "upload") {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="image-upload" className="text-sm font-semibold">
            Subir imagen del logo
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG o WebP. Máximo {maxFileSize}MB
          </p>
        </div>

        <Input
          ref={fileInputRef}
          id="image-upload"
          type="file"
          accept={acceptedFormats.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full !h-32 border-2 border-dashed hover:border-primary hover:bg-primary/5 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">Seleccionar imagen</span>
            <span className="text-xs text-muted-foreground">
              Haz clic o arrastra una imagen
            </span>
          </div>
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}
      </div>
    );
  }

  // === RENDER: CROP MODE ===
  if (mode === "crop" && imageSrc) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Ajustar imagen</Label>
          <p className="text-xs text-muted-foreground">
            Mueve la imagen y utiliza los botones laterales para zoom. Se
            guardará como cuadrado.
          </p>
        </div>

        {/* Crop Preview Container with Zoom Controls Overlay - Side Layout */}
        <div className="flex gap-2 items-center justify-center">
          {/* Zoom Out Button - Left */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleZoom("out")}
            disabled={cropState.zoom <= MIN_ZOOM}
            className="!h-10 !w-10 flex-shrink-0"
            title="Alejar (rueda del ratón)"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>

          {/* Crop Container */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="relative overflow-hidden rounded-lg border-2 border-dashed border-primary/50 bg-muted/50 cursor-move select-none flex-shrink-0"
            style={{
              width: CROP_SIZE,
              height: CROP_SIZE,
            }}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="absolute pointer-events-none"
              style={{
                width: `${imageSrc ? 200 * cropState.zoom : 0}px`,
                height: "auto",
                left: `${cropState.x}px`,
                top: `${cropState.y}px`,
                maxWidth: "none",
              }}
              draggable={false}
            />

            {/* Overlay oscuro - áreas fuera del recorte */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, 0.3)`,
              }}
            />

            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/3 left-0 right-0 border-t border-white" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-white" />
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-white" />
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-white" />
            </div>

            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
          </div>

          {/* Zoom In Button - Right */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleZoom("in")}
            disabled={cropState.zoom >= MAX_ZOOM}
            className="!h-10 !w-10 flex-shrink-0"
            title="Acercar (rueda del ratón)"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">
            Zoom: {cropState.zoom.toFixed(1)}x
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCropState({ x: 0, y: 0, zoom: 1 })}
            className="text-xs !h-7"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reiniciar
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleChangeImage}
            disabled={isProcessing}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cambiar imagen
          </Button>

          <Button
            type="button"
            onClick={handleCrop}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Guardar imagen
              </>
            )}
          </Button>
        </div>

        {/* Hidden canvas para procesamiento */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // === RENDER: PREVIEW MODE (Post-guardado) ===
  if (mode === "preview" && croppedPreview) {
    console.log("[ImageCropper] Renderizando PREVIEW MODE");

    return (
      <div style={{ width: "100%", padding: "20px", boxSizing: "border-box" }}>
        {/* Mensaje de éxito */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#16a34a",
              marginBottom: "4px",
            }}
          >
            ✓ Logo guardado correctamente
          </div>
          <div
            style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}
          >
            Tu logo se renderizará como un cuadrado en el sistema
          </div>
        </div>

        {/* PREVIEW: Contenedor y imagen */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              width: CROP_SIZE + "px",
              height: CROP_SIZE + "px",
              backgroundColor: "#f5f5f5",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {/* IMG con ref - React NO controla el src, el useEffect sí */}
            <img
              ref={previewImageRef}
              alt="Logo preview"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                border: "none",
                objectFit: "contain",
              }}
            />
            {/* Checkmark verde */}
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                backgroundColor: "rgba(34, 197, 94, 0.95)",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Check
                style={{ width: "16px", height: "16px", color: "white" }}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            type="button"
            variant="outline"
            onClick={handleChangeImage}
            style={{ flex: 1 }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Cambiar imagen
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleEditAgain}
            style={{ flex: 1 }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Re-editar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
