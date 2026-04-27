import React, { useRef, useState, useEffect } from "react";
import ReactCrop from "react-image-crop";
import type { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X, Upload, Check, Edit2, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropperNewProps {
  onImageSelect?: (imageFile: File) => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
  initialBlob?: Blob | null;
}

type Mode = "upload" | "edit" | "preview";

const CROP_SIZE = 280;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getOutputMimeType(sourceMimeType: string) {
  if (sourceMimeType === "image/webp") {
    return "image/webp";
  }

  if (sourceMimeType === "image/jpeg") {
    return "image/jpeg";
  }

  return "image/png";
}

function buildOutputFileName(sourceFileName: string, mimeType: string) {
  const extension = MIME_EXTENSION_MAP[mimeType] ?? "png";
  const baseName = sourceFileName.includes(".")
    ? sourceFileName.slice(0, sourceFileName.lastIndexOf("."))
    : sourceFileName;

  return `${baseName || "logo"}.${extension}`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

export default function ImageCropperNew({
  onImageSelect,
  maxFileSize = 5,
  acceptedFormats = ["image/png", "image/jpeg", "image/webp"],
  initialBlob = null,
}: ImageCropperNewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isChangingImageRef = useRef(false);
  const objectUrlsRef = useRef(new Set<string>());

  const [imageSrc, setImageSrc] = useState<string>("");
  const [originalImageSrc, setOriginalImageSrc] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("upload");
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: CROP_SIZE,
    height: CROP_SIZE,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [croppedBlobUrl, setCroppedBlobUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState<number>(1);
  const [imageKey, setImageKey] = useState<string>("");
  const [sourceFileName, setSourceFileName] = useState("logo.png");
  const [sourceMimeType, setSourceMimeType] = useState("image/png");

  const trackObjectUrl = (url: string) => {
    if (url.startsWith("blob:")) {
      objectUrlsRef.current.add(url);
    }

    return url;
  };

  const revokeTrackedUrl = (url: string) => {
    if (!url || !url.startsWith("blob:")) {
      return;
    }

    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  };

  // Cleanup blob URLs only when component unmounts.
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      objectUrlsRef.current.clear();
    };
  }, []);

  // Restaurar estado si hay initialBlob (imagen guardada anteriormente)
  // SOLO si estamos en upload o si no hay imagen en edición
  // Respetar el flag de cambio de imagen
  useEffect(() => {
    if (
      !isChangingImageRef.current &&
      initialBlob &&
      !croppedBlobUrl &&
      !imageSrc &&
      mode === "upload"
    ) {
      const url = trackObjectUrl(URL.createObjectURL(initialBlob));
      setOriginalImageSrc(url);
      setCroppedBlobUrl(url);
      setMode("preview");
    }
  }, [initialBlob, croppedBlobUrl, imageSrc, mode]);

  useEffect(() => {
    if (initialBlob instanceof File) {
      setSourceFileName(initialBlob.name);
      setSourceMimeType(initialBlob.type || "image/png");
    }
  }, [initialBlob]);

  // Resetear crop cuando imageSrc cambia
  useEffect(() => {
    if (imageSrc && mode === "edit") {
      setCompletedCrop(null);
      setCrop({
        unit: "px",
        width: CROP_SIZE,
        height: CROP_SIZE,
        x: 0,
        y: 0,
      });
    }
  }, [imageSrc, mode]);

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Marcar que estamos cambiando imagen
    isChangingImageRef.current = true;

    setError(null);

    if (!acceptedFormats.includes(file.type)) {
      setError("Formato no soportado. Usa PNG, JPG o WebP.");
      isChangingImageRef.current = false;
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setError(`El archivo no debe exceder ${maxFileSize}MB`);
      isChangingImageRef.current = false;
      return;
    }

    setSourceFileName(file.name);
    setSourceMimeType(file.type || "image/png");

    // Limpiar URLs blob anteriores
    revokeTrackedUrl(imageSrc);
    revokeTrackedUrl(originalImageSrc);
    revokeTrackedUrl(croppedBlobUrl);

    const url = trackObjectUrl(URL.createObjectURL(file));
    setImageSrc(url);
    setOriginalImageSrc(url);
    setMode("edit");
    setImageLoaded(false);
    setCroppedBlobUrl(""); // Limpiar blob guardado anterior
    setCompletedCrop(null); // Resetear crop completado
    setScale(1); // Resetear zoom a 100%
    setCrop({
      unit: "px",
      width: CROP_SIZE,
      height: CROP_SIZE,
      x: 0,
      y: 0,
    }); // Resetear área de crop
    setImageKey(`${Date.now()}-${Math.random()}`); // Forzar re-render del ReactCrop
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Permitir seleccionar el mismo archivo nuevamente
    }

    // Resetear flag después de un pequeño delay para asegurar que los estados se actualizaron
    setTimeout(() => {
      isChangingImageRef.current = false;
    }, 0);
  };

  const handleImageLoaded = () => {
    setImageLoaded(true);
    setCompletedCrop(null);
    if (imgRef.current && imgRef.current.width && imgRef.current.height) {
      const smaller =
        imgRef.current.width < imgRef.current.height
          ? imgRef.current.width
          : imgRef.current.height;
      setCrop({
        unit: "px",
        width: Math.min(smaller, CROP_SIZE),
        height: Math.min(smaller, CROP_SIZE),
        x: 0,
        y: 0,
      });
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((prev) => Math.max(MIN_ZOOM, Math.min(prev + delta, MAX_ZOOM)));
  };

  const generateCroppedImage = async (pixelCrop: PixelCrop) => {
    if (!imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const image = imgRef.current;

    if (!image.complete) {
      setError("La imagen no ha cargado completamente");
      return;
    }

    if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      setError("Imagen con dimensiones inválidas");
      return;
    }

    // Para JPG: no usar alpha (no soporta transparencia). Para PNG/WebP: usar alpha
    const useAlpha = sourceMimeType !== "image/jpeg";
    const ctx = canvas.getContext("2d", { alpha: useAlpha });
    if (!ctx) {
      setError("No se pudo obtener el contexto del canvas");
      return;
    }

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = CROP_SIZE * pixelRatio;
    canvas.height = CROP_SIZE * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    
    // Para JPG: llenar con blanco (no soporta transparencia). Para PNG: dejar transparente
    if (!useAlpha) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);
    }

    // Con scale CSS, ReactCrop reporta coordenadas en el espacio sin escalar
    // Necesitamos ajustar por el scale y convertir al espacio natural
    const scaleRatio = image.naturalWidth / image.width;

    const sourceX = pixelCrop.x * scale * scaleRatio;
    const sourceY = pixelCrop.y * scale * scaleRatio;
    const sourceWidth = pixelCrop.width * scale * scaleRatio;
    const sourceHeight = pixelCrop.height * scale * scaleRatio;

    // Asegurar que no haya valores NaN o infinitos
    if (
      isNaN(sourceX) ||
      isNaN(sourceY) ||
      isNaN(sourceWidth) ||
      isNaN(sourceHeight)
    ) {
      setError("Coordenadas de crop inválidas");
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = "copy";
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
    ctx.restore();
  };

  const handleCrop = async () => {
    // Bloquear si estamos cambiando imagen
    if (isChangingImageRef.current) {
      setError("Por favor, espera a que la imagen termine de cargar");
      return;
    }

    if (!imgRef.current) {
      setError("Imagen no válida");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Si no hay completedCrop, usar el crop por defecto
      const cropToUse = (completedCrop || crop) as PixelCrop;

      // Validar que cropToUse es válido
      if (!cropToUse || cropToUse.width <= 0 || cropToUse.height <= 0) {
        throw new Error("Área de crop inválida");
      }

      // Validar que imageSrc es la correcta (no una versión anterior)
      if (!imageSrc || imageSrc !== imgRef.current.src) {
        throw new Error("Estado de imagen inconsistente");
      }

      await generateCroppedImage(cropToUse);

      if (canvasRef.current) {
        const preferredMimeType = getOutputMimeType(sourceMimeType);
        let blob = await canvasToBlob(
          canvasRef.current,
          preferredMimeType,
          preferredMimeType === "image/jpeg" ? 0.92 : 0.95,
        );
        let finalMimeType = blob?.type || preferredMimeType;

        if (!blob && preferredMimeType === "image/webp") {
          blob = await canvasToBlob(canvasRef.current, "image/png", 0.95);
          finalMimeType = blob?.type || "image/png";
        }

        if (!blob) {
          setError("Error al generar la imagen recortada");
          setIsProcessing(false);
          return;
        }

        const outputFile = new File(
          [blob],
          buildOutputFileName(sourceFileName, finalMimeType),
          {
            type: finalMimeType,
            lastModified: Date.now(),
          },
        );

        revokeTrackedUrl(croppedBlobUrl);

        const url = trackObjectUrl(URL.createObjectURL(outputFile));
        setCroppedBlobUrl(url);
        if (onImageSelect) {
          onImageSelect(outputFile);
        }
        setMode("preview");
        setCompletedCrop(null); // Resetear para la siguiente edición
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Error en handleCrop:", err);
      setError("Error al procesar la imagen");
      setIsProcessing(false);
    }
  };

  const handleEditAgain = () => {
    const sourceToEdit = originalImageSrc || croppedBlobUrl;

    if (!sourceToEdit) {
      handleOpenFileSelector();
      return;
    }

    isChangingImageRef.current = true;
    setError(null);
    setImageSrc(sourceToEdit);
    setMode("edit");
    setImageLoaded(false);
    setScale(1);
    setCompletedCrop(null);
    setCrop({
      unit: "px",
      width: CROP_SIZE,
      height: CROP_SIZE,
      x: 0,
      y: 0,
    });
    setImageKey(`${Date.now()}-${Math.random()}`);

    setTimeout(() => {
      isChangingImageRef.current = false;
    }, 0);
  };

  // Renderizar basado en modo
  let content;

  if (mode === "upload") {
    content = (
      <div className="space-y-4">
        <div>
          <Label htmlFor="image-upload-new" className="text-sm font-semibold">
            Subir imagen del logo
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG o WebP. Máximo {maxFileSize}MB
          </p>
        </div>

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
  } else if (mode === "edit" && imageSrc) {
    content = (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold">Ajustar imagen</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Ajusta el recorte para que sea cuadrado. Usa zoom si es necesario.
          </p>
        </div>

        <div
          className="flex justify-center relative bg-white rounded-lg p-4 border-2 border-gray-200"
          onWheel={handleWheel}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 rounded-lg">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <ReactCrop
            key={imageKey}
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            circularCrop={false}
            minWidth={50}
            minHeight={50}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop"
              onLoad={handleImageLoaded}
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                scale: scale,
              }}
            />
          </ReactCrop>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= MIN_ZOOM}
            className="!h-10 !w-10"
            title="Alejar"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {(scale * 100).toFixed(0)}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= MAX_ZOOM}
            className="!h-10 !w-10"
            title="Acercar"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Usa la rueda del ratón o los botones para hacer zoom
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOpenFileSelector}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-1" />
            Cambiar
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleCrop}
            disabled={isProcessing || !imageLoaded}
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Guardar
              </>
            )}
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  } else if (mode === "preview" && croppedBlobUrl) {
    content = (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold">Logo cargado</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Tu logo se utilizará en el sistema
          </p>
        </div>

        <div className="flex justify-center">
          <div
            className="relative rounded-lg border-2 border-gray-200 bg-gray-50 overflow-hidden"
            style={{ width: "280px", height: "280px" }}
          >
            <img
              src={croppedBlobUrl}
              alt="Logo preview"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
            <div
              className="absolute top-2 right-2 bg-green-500 rounded-full flex items-center justify-center"
              style={{ width: "28px", height: "28px" }}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-green-600">
            ✓ Logo guardado correctamente
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleEditAgain}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Re-editar o cambiar
          </Button>
        </div>
      </div>
    );
  } else {
    content = null;
  }

  // Retornar con Input file único fuera de ramas condicionales
  return (
    <>
      <Input
        ref={fileInputRef}
        id="image-upload-new"
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />
      {content}
    </>
  );
}
