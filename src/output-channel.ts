import * as vscode from "vscode";

export class OutputChannel {
  protected static channel = vscode.window.createOutputChannel("Gest");

  static error(message: string) {
    this.channel.appendLine(message);
  }
}
