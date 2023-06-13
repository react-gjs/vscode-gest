import * as vscode from "vscode";
import type { ProgramContext } from "../program";
import {
  buildCommandAllFiles,
  buildCommandSpecificFile,
} from "./build-commend";
import { Register, getAllMethod } from "./decorator";

export class Commands {
  public get config() {
    return this.program.config;
  }

  constructor(protected readonly program: ProgramContext) {}

  public initiate(context: vscode.ExtensionContext) {
    const commandsList = getAllMethod(this);

    for (const { cmdId, method } of commandsList) {
      const disposable = vscode.commands.registerCommand(cmdId, method);
      context.subscriptions.push(disposable);
    }
  }

  public getIdentifier(method: Function) {
    const commandsList = getAllMethod(this);

    const meta = commandsList.find((item) => item.method === method);

    if (!meta) {
      throw new Error("Method not registered");
    }

    return meta.cmdId;
  }

  @Register()
  public async runTest(testName?: Record<string, unknown> | string) {
    if (typeof testName === "string") {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      await editor.document.save();

      const filePath = editor.document.fileName;
      const command = buildCommandSpecificFile(this.config, filePath, testName);

      this.program.runInTerminal(command);
    }
  }

  @Register()
  public async runAll() {
    const command = buildCommandAllFiles(this.config);

    this.program.runInTerminal(command);
  }
}
