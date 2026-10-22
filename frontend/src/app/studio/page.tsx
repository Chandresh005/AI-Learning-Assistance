"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LearningStudioWorkspace } from "@/components/studio/LearningStudioWorkspace";

function StudioPageContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get("day");
  const urlParam = searchParams.get("url");

  const parsedDayIndex = dayParam
    ? Math.max(0, Math.min(9, parseInt(dayParam, 10) - 1))
    : 0;

  return (
    <LearningStudioWorkspace
      initialDayIndex={isNaN(parsedDayIndex) ? 0 : parsedDayIndex}
      initialCustomUrl={urlParam || undefined}
    />
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center text-sm">
          Loading Intelligent Learning Studio...
        </div>
      }
    >
      <StudioPageContent />
    </Suspense>
  );
}
