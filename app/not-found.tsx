// Arquivo: src/app/not-found.tsx
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030f26] text-gray-900 dark:text-white transition-colors duration-300 font-sans">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-medium border-r border-gray-300 dark:border-gray-600 pr-6 py-2">
          404
        </h1>
        <p className="text-sm font-normal">Esta página não foi encontrada.</p>
      </div>
    </div>
  );
}
