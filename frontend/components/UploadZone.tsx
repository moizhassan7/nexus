"use client";

import { useCallback, useState } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function UploadZone({
  onFileSelect,
  selectedFile,
}: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
        dragOver
          ? "border-shield-500 bg-shield-50"
          : "border-slate-300 bg-white hover:border-shield-400"
      }`}
    >
      <input
        type="file"
        accept=".yaml,.yml,.json"
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      <div className="text-center">
        <p className="text-4xl">📄</p>
        <p className="mt-2 font-medium text-slate-700">
          Drag & drop your OpenAPI spec
        </p>
        <p className="mt-1 text-sm text-slate-500">
          or click to browse — .yaml, .yml, .json
        </p>
        {selectedFile && (
          <p className="mt-3 rounded-lg bg-shield-50 px-3 py-1 text-sm font-medium text-shield-700">
            Selected: {selectedFile.name}
          </p>
        )}
      </div>
    </div>
  );
}
