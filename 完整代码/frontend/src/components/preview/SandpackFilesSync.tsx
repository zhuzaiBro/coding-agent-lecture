"use client";

import { useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";
import { mergeSandpackFiles } from "@/lib/mergeSandpackFiles";
import { useSandpackStore } from "@/store/sandpackStore";

interface SandpackFilesSyncProps {
  templateFiles: Record<string, { code: string }>;
}

/**
 * SandpackProvider 挂载后不会自动响应 files prop 增量变化，
 * 需要在内部用 updateFile / openFile 同步新文件到文件树。
 */
export function SandpackFilesSync({ templateFiles }: SandpackFilesSyncProps) {
  const { sandpack } = useSandpack();
  const { generatedFiles, isGenerating, filesRevision, recentFiles, generationSessionId } =
    useSandpackStore();
  const syncedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    syncedRef.current = {};
  }, [generationSessionId]);

  useEffect(() => {
    const mergedRecords = mergeSandpackFiles(templateFiles, generatedFiles);
    const merged: Record<string, string> = {};
    Object.entries(mergedRecords).forEach(([path, file]) => {
      merged[path] = file.code;
    });

    let hasChanges = false;

    for (const [path, code] of Object.entries(merged)) {
      if (syncedRef.current[path] === code) continue;
      sandpack.updateFile(path, code);
      syncedRef.current[path] = code;
      hasChanges = true;
    }

    if (!hasChanges) return;

    const hasApp =
      generatedFiles !== null && Object.keys(generatedFiles).length > 0;

    if (hasApp) {
      try {
        sandpack.openFile("/src/App.tsx");
      } catch (error) {
        console.warn("[SandpackFilesSync] openFile /src/App.tsx failed:", error);
      }
    } else if (isGenerating && recentFiles[0]) {
      try {
        sandpack.openFile(recentFiles[0]);
      } catch (error) {
        console.warn("[SandpackFilesSync] openFile failed:", recentFiles[0], error);
      }
    }

    sandpack.runSandpack();
  }, [
    filesRevision,
    templateFiles,
    generatedFiles,
    sandpack,
    isGenerating,
    recentFiles,
  ]);

  return null;
}
