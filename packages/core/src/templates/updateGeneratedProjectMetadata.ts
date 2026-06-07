import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface ProjectMetadataOptions {
  projectName: string;
}

const metadataFiles = [
  ".avipack/brain/project.yaml",
  "avipack.config.yaml",
  "README.md"
];

export async function updateGeneratedProjectMetadata(
  targetPath: string,
  options: ProjectMetadataOptions
): Promise<void> {
  await Promise.all(
    metadataFiles.map(async (relativePath) => {
      const filePath = join(targetPath, relativePath);
      const source = await readFile(filePath, "utf8");
      const updated = source
        .replaceAll("sample-project", options.projectName)
        .replaceAll("Sample Project", options.projectName);

      await writeFile(filePath, updated);
    })
  );
}
