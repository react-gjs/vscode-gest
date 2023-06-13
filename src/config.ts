import type { ParserPlugin } from "@babel/parser";
import * as vscode from "vscode";

type GestRunnerConfig = {
  cwd?: string;
  gestPath?: string;
  verboseArg?: boolean;
  silenceLogsArg?: boolean;
  arguments: string[];
  env?: string[];
  clearTerminal?: boolean;
  parserPlugins?: ParserPlugin[];
};

type Defined<T> = Exclude<T, undefined>;

export class Config {
  get<K extends keyof GestRunnerConfig>(
    key: K,
    defaultValue: Defined<GestRunnerConfig[K]>
  ): Defined<GestRunnerConfig[K]>;
  get<K extends keyof GestRunnerConfig>(
    key: K,
    defaultValue?: GestRunnerConfig[K]
  ): GestRunnerConfig[K];
  get(key: any, defaultValue: any): any {
    const c = vscode.workspace.getConfiguration("gest");
    const value = c.get(key);

    if (value !== null) {
      return value;
    }

    return defaultValue;
  }
}
