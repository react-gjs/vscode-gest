import * as vscode from "vscode";
import { OutputChannel } from "./output-channel";
import { Parser } from "./parser/parser";
import type { ProgramContext } from "./program";
import { parseError } from "./utils/parse-error";

export class CodeLensController {
  protected documentParser;

  constructor(protected readonly program: ProgramContext) {
    this.documentParser = new Parser(program);
  }

  protected getLens(range: vscode.Range, fullTestName: string) {
    const command = this.program.commands;

    return new vscode.CodeLens(range, {
      arguments: [fullTestName],
      title: "Run",
      command: command.getIdentifier(command.runTest),
    });
  }

  public provideCodeLenses(document: vscode.TextDocument) {
    try {
      const elements = this.documentParser.parse(document);

      const lenses = elements.map((element) => {
        const range = new vscode.Range(
          document.positionAt(element.start),
          document.positionAt(element.end)
        );

        return this.getLens(range, element.name);
      });

      return lenses;
    } catch (error) {
      OutputChannel.error(parseError(error));
    }
  }

  public initiate(context: vscode.ExtensionContext) {
    const langSelectors: vscode.DocumentSelector = [
      {
        scheme: "file",
        language: "typescript",
        pattern: "**/*.test{.ts,.cts,.mts}",
      },

      {
        scheme: "file",
        language: "javascript",
        pattern: "**/*.test{.js,.cjs,.mjs}",
      },
      {
        scheme: "file",
        language: "typescriptreact",
        pattern: "**/*.test{.tsx,.ctsx,.mtsx}",
      },
      {
        scheme: "file",
        language: "javascriptreact",
        pattern: "**/*.test{.jsx,.cjsx,.mjsx}",
      },
    ];

    const disposable = vscode.languages.registerCodeLensProvider(
      langSelectors,
      this
    );

    context.subscriptions.push(disposable);
  }
}
