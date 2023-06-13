import * as vscode from "vscode";
import { CodeLensController } from "./code-lens";
import { Commands } from "./commands/commands";
import { Config } from "./config";

class ProgramContext {
  protected terminal: vscode.Terminal | undefined;
  public commands!: Commands;
  public codeLens!: CodeLensController;

  public config = new Config();

  constructor(context: vscode.ExtensionContext) {
    const disposable = vscode.window.onDidCloseTerminal(
      (closedTerminal: vscode.Terminal) => {
        if (this.terminal === closedTerminal) {
          this.terminal = undefined;
        }
      }
    );
    context.subscriptions.push(disposable);
  }

  public getTerminal(): vscode.Terminal {
    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal("gest");
    }

    return this.terminal;
  }

  public runInTerminal(command: string): void {
    const term = this.getTerminal();

    term.show();
    setTimeout(() => {
      if (this.config.get("clearTerminal", false)) {
        term.sendText("clear");
      }
      term.sendText(command);
    });
  }
}

export class Program {
  protected context!: ProgramContext;

  public start(context: vscode.ExtensionContext): void {
    this.context = new ProgramContext(context);

    this.context.commands = new Commands(this.context);
    this.context.codeLens = new CodeLensController(this.context);

    this.context.commands.initiate(context);
    this.context.codeLens.initiate(context);
  }

  public stop(): void {}
}

export type { ProgramContext };
