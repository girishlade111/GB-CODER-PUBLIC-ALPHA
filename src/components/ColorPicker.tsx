import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Pipette, Copy, Check, ChevronDown } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialColor?: string;
  onColorSelect: (color: string) => void;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

const STORAGE_KEY = "gb-coder-recent-colors";
const MAX_RECENT_COLORS = 12;

const MATERIAL_COLORS = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B",
  "#000000",
  "#FFFFFF",
];

const TAILWIND_COLORS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#64748B",
  "#1E293B",
  "#FFFFFF",
];

const BOOTSTRAP_COLORS = [
  "#0D6EFD",
  "#6610F2",
  "#6F42C1",
  "#D63384",
  "#DC3545",
  "#FD7E14",
  "#FFC107",
  "#198754",
  "#20C997",
  "#0DCAF0",
  "#6C757D",
  "#F8F9FA",
  "#000000",
  "#FFFFFF",
];

const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = ({ r, g, b }: RGB): string => {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const rgbToHsl = ({ r, g, b }: RGB): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = ({ h, s, l }: HSL): RGB => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const hslToHex = (hsl: HSL): string => {
  return rgbToHex(hslToRgb(hsl));
};

const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

const parseColorInput = (input: string): string => {
  const trimmed = input.trim();

  if (isValidHex(trimmed)) {
    return trimmed.startsWith("#") ? trimmed : "#" + trimmed;
  }

  const rgbMatch = trimmed.match(
    /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
  );
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1]));
    const g = Math.min(255, parseInt(rgbMatch[2]));
    const b = Math.min(255, parseInt(rgbMatch[3]));
    return rgbToHex({ r, g, b });
  }

  const hslMatch = trimmed.match(
    /^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i,
  );
  if (hslMatch) {
    const h = Math.min(360, parseInt(hslMatch[1]));
    const s = Math.min(100, parseInt(hslMatch[2]));
    const l = Math.min(100, parseInt(hslMatch[3]));
    return hslToHex({ h, s, l });
  }

  return "";
};

const loadRecentColors = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentColor = (color: string): void => {
  try {
    let recent = loadRecentColors();
    recent = recent.filter((c) => c.toLowerCase() !== color.toLowerCase());
    recent.unshift(color);
    if (recent.length > MAX_RECENT_COLORS) {
      recent = recent.slice(0, MAX_RECENT_COLORS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // Silently fail if localStorage is not available
  }
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  onClose,
  initialColor = "#3B82F6",
  onColorSelect,
}) => {
  const { isDark } = useTheme();

  const [currentColor, setCurrentColor] = useState(initialColor);
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 });
  const [alpha, setAlpha] = useState(100);
  const [hexInput, setHexInput] = useState(initialColor);
  const [rgbInput, setRgbInput] = useState({ r: 59, g: 130, b: 246 });
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [activePalette, setActivePalette] = useState<
    "material" | "tailwind" | "bootstrap"
  >("material");
  const [showPalettes, setShowPalettes] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [eyedropperSupported, setEyedropperSupported] = useState(false);

  const satLightRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEyedropperSupported("EyeDropper" in window);
  }, []);

  useEffect(() => {
    setRecentColors(loadRecentColors());
  }, []);

  useEffect(() => {
    if (isValidHex(initialColor)) {
      setCurrentColor(initialColor);
      setHexInput(initialColor);
      const rgb = hexToRgb(initialColor);
      if (rgb) {
        setRgbInput(rgb);
        setHsl(rgbToHsl(rgb));
      }
    }
  }, [initialColor]);

  const updateFromHsl = useCallback((newHsl: HSL, newAlpha?: number) => {
    setHsl(newHsl);
    const hex = hslToHex(newHsl);
    setCurrentColor(hex);
    setHexInput(hex);
    const rgb = hslToRgb(newHsl);
    setRgbInput(rgb);
    if (newAlpha !== undefined) {
      setAlpha(newAlpha);
    }
  }, []);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    const parsed = parseColorInput(value);
    if (parsed && isValidHex(parsed)) {
      setCurrentColor(parsed);
      const rgb = hexToRgb(parsed);
      if (rgb) {
        setRgbInput(rgb);
        setHsl(rgbToHsl(rgb));
      }
    }
  };

  const handleHslChange = (component: "h" | "s" | "l", value: string) => {
    let numValue = parseInt(value) || 0;
    if (component === "h") numValue = Math.min(360, Math.max(0, numValue));
    else numValue = Math.min(100, Math.max(0, numValue));

    const newHsl = { ...hsl, [component]: numValue };
    updateFromHsl(newHsl);
  };

  const handleSatLightPicker = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!satLightRef.current) return;
    const rect = satLightRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    const newHsl = { ...hsl, s: x * 100, l: (1 - y) * 100 };
    updateFromHsl(newHsl);
  };

  const handleHuePicker = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const newHsl = { ...hsl, h: x * 360 };
    updateFromHsl(newHsl);
  };

  const handleAlphaPicker = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setAlpha(Math.round(x * 100));
    const alphaHex = Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
    setCurrentColor((prev) => prev + alphaHex);
  };

  const handleEyedropper = async () => {
    if (!eyedropperSupported) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      const color = result.sRGBHex;
      setCurrentColor(color);
      setHexInput(color);
      const rgb = hexToRgb(color);
      if (rgb) {
        setRgbInput(rgb);
        setHsl(rgbToHsl(rgb));
      }
    } catch {
      // User cancelled or error
    }
  };

  const handleCopy = (format: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
    setHexInput(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgbInput(rgb);
      setHsl(rgbToHsl(rgb));
    }
  };

  const handleApply = () => {
    saveRecentColor(currentColor);
    setRecentColors(loadRecentColors());
    const finalColor =
      alpha < 100
        ? `rgba(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b}, ${alpha / 100})`
        : currentColor;
    onColorSelect(finalColor);
    onClose();
  };

  const getColorWithAlpha = (hex: string, a: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a / 100})`;
  };

  if (!isOpen) return null;

  const presetPalettes = {
    material: MATERIAL_COLORS,
    tailwind: TAILWIND_COLORS,
    bootstrap: BOOTSTRAP_COLORS,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg mx-4 rounded-xl shadow-vscode-modal animate-scale-in border max-h-[90vh] overflow-hidden flex flex-col ${
          isDark ? "bg-dark-gray border-gray-700" : "bg-white border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-bold ${isDark ? "text-bright-white" : "text-gray-900"}`}
          >
            Color Picker
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
              <div
                ref={satLightRef}
                className="relative w-full h-40 rounded-lg cursor-crosshair overflow-hidden"
                style={{
                  background: `linear-gradient(to right, #fff, hsl(${hsl.h}, 100%, 50%))`,
                }}
                onMouseDown={(e) => {
                  handleSatLightPicker(e);
                  const moveHandler = (ev: MouseEvent) =>
                    handleSatLightPicker(
                      ev as unknown as React.MouseEvent<HTMLDivElement>,
                    );
                  const upHandler = () => {
                    document.removeEventListener("mousemove", moveHandler);
                    document.removeEventListener("mouseup", upHandler);
                  };
                  document.addEventListener("mousemove", moveHandler);
                  document.addEventListener("mouseup", upHandler);
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, transparent, #000)",
                  }}
                />
                <div
                  className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${hsl.s}%`,
                    top: `${100 - hsl.l}%`,
                    backgroundColor: currentColor,
                  }}
                />
              </div>

              <div
                ref={hueRef}
                className="relative w-full h-4 rounded-lg cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
                }}
                onMouseDown={(e) => {
                  handleHuePicker(e);
                  const moveHandler = (ev: MouseEvent) =>
                    handleHuePicker(
                      ev as unknown as React.MouseEvent<HTMLDivElement>,
                    );
                  const upHandler = () => {
                    document.removeEventListener("mousemove", moveHandler);
                    document.removeEventListener("mouseup", upHandler);
                  };
                  document.addEventListener("mousemove", moveHandler);
                  document.addEventListener("mouseup", upHandler);
                }}
              >
                <div
                  className="absolute w-3 h-5 bg-white border-2 border-gray-600 rounded-sm transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-md pointer-events-none"
                  style={{ left: `${(hsl.h / 360) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Alpha
                  </span>
                  <span
                    className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {alpha}%
                  </span>
                </div>
                <div
                  ref={alphaRef}
                  className="relative w-full h-4 rounded-lg cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, transparent 0%, ${currentColor} 100%), 
                      ${isDark ? "repeating-conic-gradient(#333 0% 25%, #444 0% 50%) 50% / 8px 8px" : "repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 8px 8px"}`,
                  }}
                  onMouseDown={(e) => {
                    handleAlphaPicker(e);
                    const moveHandler = (ev: MouseEvent) =>
                      handleAlphaPicker(
                        ev as unknown as React.MouseEvent<HTMLDivElement>,
                      );
                    const upHandler = () => {
                      document.removeEventListener("mousemove", moveHandler);
                      document.removeEventListener("mouseup", upHandler);
                    };
                    document.addEventListener("mousemove", moveHandler);
                    document.addEventListener("mouseup", upHandler);
                  }}
                >
                  <div
                    className="absolute w-3 h-5 bg-white border-2 border-gray-600 rounded-sm transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-md pointer-events-none"
                    style={{ left: `${alpha}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="w-28 space-y-3">
              <div
                className={`w-full h-20 rounded-lg border ${
                  isDark ? "border-gray-600" : "border-gray-300"
                }`}
                style={{
                  backgroundColor:
                    alpha < 100
                      ? `rgba(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b}, ${alpha / 100})`
                      : currentColor,
                  backgroundImage:
                    alpha < 100
                      ? `linear-gradient(45deg, ${isDark ? "#333" : "#ccc"} 25%, transparent 25%), linear-gradient(-45deg, ${isDark ? "#333" : "#ccc"} 25%, transparent 50%), linear-gradient(45deg, transparent 75%, ${isDark ? "#333" : "#ccc"} 75%), linear-gradient(-45deg, transparent 75%, ${isDark ? "#333" : "#ccc"} 75%)`
                      : "none",
                  backgroundSize: alpha < 100 ? "8px 8px" : "auto",
                  backgroundPosition:
                    alpha < 100 ? "0 0, 0 4px, 4px -4px, -4px 0px" : "auto",
                }}
              >
                <div
                  className="w-full h-full rounded-lg"
                  style={{
                    backgroundColor:
                      alpha < 100
                        ? `rgba(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b}, ${alpha / 100})`
                        : currentColor,
                  }}
                />
              </div>

              <div className="space-y-1">
                <label
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  HEX
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className={`flex-1 px-2 py-1.5 text-sm rounded border ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-bright-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                  />
                  <button
                    onClick={() => handleCopy("hex", hexInput)}
                    className={`p-1.5 rounded ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                    title="Copy"
                  >
                    {copiedFormat === "hex" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy
                        className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  RGB
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={`${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b}`}
                    readOnly
                    className={`flex-1 px-2 py-1.5 text-sm rounded border ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-bright-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none`}
                  />
                  <button
                    onClick={() =>
                      handleCopy(
                        "rgb",
                        `rgb(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b})`,
                      )
                    }
                    className={`p-1.5 rounded ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                    title="Copy"
                  >
                    {copiedFormat === "rgb" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy
                        className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  HSL
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={`${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`}
                    readOnly
                    className={`flex-1 px-2 py-1.5 text-sm rounded border ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-bright-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none`}
                  />
                  <button
                    onClick={() =>
                      handleCopy(
                        "hsl",
                        `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
                      )
                    }
                    className={`p-1.5 rounded ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                    title="Copy"
                  >
                    {copiedFormat === "hsl" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy
                        className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      />
                    )}
                  </button>
                </div>
              </div>

              {eyedropperSupported && (
                <button
                  onClick={handleEyedropper}
                  className={`w-full flex items-center justify-center gap-2 px-3 py border transition-colors ${
                    isDark
                      ? "border-2 rounded-lg-gray-600 hover:bg-gray-700 text-gray-300"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <Pipette className="w-4 h-4" />
                  <span className="text-sm">Eyedropper</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Recent Colors
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentColors.length > 0 ? (
                recentColors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => handleColorSelect(color)}
                    className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                      color.toLowerCase() === currentColor.toLowerCase()
                        ? "border-blue-500"
                        : isDark
                          ? "border-gray-600"
                          : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))
              ) : (
                <span
                  className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  No recent colors
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowPalettes(!showPalettes)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                isDark
                  ? "border-gray-600 hover:bg-gray-700 text-gray-300"
                  : "border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="text-sm font-medium">Preset Palettes</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showPalettes ? "rotate-180" : ""}`}
              />
            </button>

            {showPalettes && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(["material", "tailwind", "bootstrap"] as const).map(
                    (palette) => (
                      <button
                        key={palette}
                        onClick={() => setActivePalette(palette)}
                        className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                          activePalette === palette
                            ? isDark
                              ? "bg-blue-600 text-white"
                              : "bg-blue-600 text-white"
                            : isDark
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {palette.charAt(0).toUpperCase() + palette.slice(1)}
                      </button>
                    ),
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {presetPalettes[activePalette].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                        color.toLowerCase() === currentColor.toLowerCase()
                          ? "border-blue-500"
                          : isDark
                            ? "border-gray-600"
                            : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`flex items-center justify-end gap-3 px-5 py-4 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Apply Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
