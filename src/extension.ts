import "reflect-metadata";
import type * as vscode from "vscode";
import { OutputChannel } from "./output-channel";
import { Program } from "./program";
import { parseError } from "./utils/parse-error";

let program: Program | undefined;

export function activate(context: vscode.ExtensionContext): void {
  try {
    program = new Program();
    program.start(context);
  } catch (error) {
    OutputChannel.error(parseError(error));
  }
}

export function deactivate(): void {
  program?.stop();
}
