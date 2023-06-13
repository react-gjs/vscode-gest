import path from "path";
import type { Config } from "../config";
import { escapeRegexp } from "../utils/escape-regexp";
import { escapeShell } from "../utils/escape-shell";

const makeCommand = (config: Config, cmd: string[]) => {
  if (config.get("verboseArg", false)) {
    cmd.push("--verbose");
  }

  if (config.get("silenceLogsArg", false)) {
    cmd.push("--silenceLogs");
  }

  for (const arg of config.get("arguments", [])) {
    cmd.push(arg);
  }

  for (const env of config.get("env", [])) {
    const [name, value] = env.split("=");
    if (!name || !value) continue;
    cmd.unshift(`${name}=${value}`);
  }

  return cmd.join(" ");
};

export const buildCommandSpecificFile = (
  config: Config,
  filePath: string,
  testName: string
) => {
  const cwd = config.get("cwd", ".");
  const binPath = path.join(
    cwd,
    config.get("gestPath", "./node_modules/.bin/gest")
  );

  const cmd = [binPath, "-f", escapeShell(filePath)];

  if (testName) {
    cmd.push("-t", escapeShell(escapeRegexp(testName)));
  }

  return makeCommand(config, cmd);
};

export const buildCommandAllFiles = (config: Config) => {
  const cwd = config.get("cwd", ".");
  const binPath = path.join(
    cwd,
    config.get("gestPath", "./node_modules/.bin/gest")
  );

  const cmd = [binPath];

  return makeCommand(config, cmd);
};
