import { execSync } from "child_process";
import { build } from "esbuild";
import path from "path";
import { rimraf } from "rimraf";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const p = (file) => path.resolve(__dirname, "..", file);

const tmpDir = p("./node_modules/.tmp");

async function main() {
  try {
    execSync('yarn tsc --outDir "' + tmpDir + '"');

    await build({
      target: "es2022",
      entryPoints: [path.join(tmpDir, "extension.js")],
      outfile: p("dist/extension.js"),
      platform: "node",
      format: "cjs",
      external: ["vscode"],
      sourcemap: "external",
      bundle: true,
    });

    rimraf(tmpDir);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
