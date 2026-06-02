import { create } from "zustand";
import type { SandpackStore, SandpackFiles } from "@/types/store";

// Re-export types for backward compatibility
export type { SandpackFiles };

function toSandpackFiles(files: Record<string, string>): SandpackFiles {
  const sandpackFiles: SandpackFiles = {};
  Object.entries(files).forEach(([path, code]) => {
    sandpackFiles[path] = { code };
  });
  return sandpackFiles;
}

export const useSandpackStore = create<SandpackStore>((set) => ({
  viewMode: "preview",
  setViewMode: (mode) => set({ viewMode: mode }),

  generatedFiles: null,
  setGeneratedFiles: (files) => {
    const sandpackFiles = toSandpackFiles(files);
    set((state) => ({
      generatedFiles: sandpackFiles,
      generatedFileCount: Object.keys(sandpackFiles).length,
      recentFiles: Object.keys(sandpackFiles).slice(-5).reverse(),
      filesRevision: state.filesRevision + 1,
    }));
  },
  mergeGeneratedFiles: (files, meta) =>
    set((state) => {
      const merged: SandpackFiles = { ...(state.generatedFiles ?? {}) };
      const newPaths: string[] = [];

      Object.entries(files).forEach(([path, code]) => {
        merged[path] = { code };
        newPaths.push(path);
      });

      const recentFiles = [
        ...newPaths.reverse(),
        ...state.recentFiles.filter((path) => !newPaths.includes(path)),
      ].slice(0, 5);

      return {
        generatedFiles: merged,
        generatedFileCount: Object.keys(merged).length,
        recentFiles,
        generationStep: meta?.step ?? state.generationStep,
        generationStepTitle: meta?.stepTitle ?? state.generationStepTitle,
        filesRevision: state.filesRevision + 1,
      };
    }),
  clearGeneratedFiles: () =>
    set((state) => ({
      generatedFiles: null,
      generatedFileCount: 0,
      recentFiles: [],
      filesRevision: state.filesRevision + 1,
    })),

  isGenerating: false,
  generationSessionId: null,
  generationStep: null,
  generationStepTitle: "准备生成...",
  generatedFileCount: 0,
  recentFiles: [],
  filesRevision: 0,
  previewReadyKey: 0,
  startGeneration: (sessionId) =>
    set((state) => ({
      isGenerating: true,
      isAssembling: false,
      generationSessionId: sessionId,
      generationStep: null,
      generationStepTitle: "正在分析需求...",
      generatedFiles: {},
      generatedFileCount: 0,
      recentFiles: [],
      filesRevision: state.filesRevision + 1,
    })),
  updateGenerationStep: (step, stepTitle) =>
    set({
      generationStep: step,
      generationStepTitle: stepTitle,
    }),
  finishGeneration: () =>
    set({
      isGenerating: false,
      isAssembling: false,
      generationStep: null,
    }),
  completeGeneration: () =>
    set((state) => ({
      isGenerating: false,
      isAssembling: false,
      generationStep: null,
      generationStepTitle: "生成完成",
      previewReadyKey: state.previewReadyKey + 1,
    })),

  isAssembling: false,
  setIsAssembling: (isAssembling) => set({ isAssembling }),
}));
