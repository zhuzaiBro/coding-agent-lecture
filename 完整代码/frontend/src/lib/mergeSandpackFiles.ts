import type { SandpackFiles } from "@/types/store";

/** 根目录 → Sandpack react-ts 模板实际入口路径 */
const ROOT_TO_SRC_MIRROR: Array<[string, string]> = [
  ["/App.tsx", "/src/App.tsx"],
  ["/index.tsx", "/src/index.tsx"],
  ["/styles.css", "/src/styles.css"],
];

/**
 * 合并模板与生成文件，并将根目录入口镜像到 /src/ 下。
 * Sandpack react-ts 模板实际从 /src/index.tsx 启动，若只写 /App.tsx 预览不会更新。
 */
export function mergeSandpackFiles(
  templateFiles: Record<string, { code: string }>,
  generatedFiles: SandpackFiles | null,
): Record<string, { code: string }> {
  const merged: Record<string, { code: string }> = { ...templateFiles };

  if (generatedFiles) {
    Object.entries(generatedFiles).forEach(([path, file]) => {
      merged[path] = file;
    });
  }

  const hasGeneratedApp =
    generatedFiles !== null && Object.keys(generatedFiles).length > 0;

  if (hasGeneratedApp) {
    for (const [rootPath, srcPath] of ROOT_TO_SRC_MIRROR) {
      const file = merged[rootPath];
      if (file) {
        merged[srcPath] = file;
      }
    }
  }

  return merged;
}

export function hasGeneratedApp(files: SandpackFiles | null): boolean {
  return files !== null && Object.keys(files).length > 0;
}

export function getSandpackActiveFile(files: SandpackFiles | null): string {
  return hasGeneratedApp(files) ? "/src/App.tsx" : "/App.tsx";
}

export function getSandpackVisibleFiles(files: SandpackFiles | null): string[] {
  if (hasGeneratedApp(files)) {
    return ["/src/App.tsx", "/src/index.tsx", "/styles.css"];
  }
  return ["/App.tsx", "/index.tsx", "/styles.css"];
}
