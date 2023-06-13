import * as parser from "@babel/parser";
import type {
  ArrowFunctionExpression,
  Node as BabelNode,
  ExpressionStatement,
  FunctionExpression,
  Statement,
  StringLiteral,
} from "@babel/types";
import type * as vscode from "vscode";
import type { ProgramContext } from "../program";

const deepGet = <Node = BabelNode>(node: any, ...types: string[]) =>
  // $FlowIgnore[value-as-type]
  types.reduce<Node>((rootForType, type) => {
    let result: any = rootForType;

    while (result[type as keyof BabelNode]) {
      result = result[type];
    }

    return result as Node;
  }, node as any);

const isFunctionCall = (node: BabelNode): node is ExpressionStatement =>
  node && node.type === "CallExpression";

const isFunctionDeclaration = (
  node: any
): node is ArrowFunctionExpression | FunctionExpression =>
  node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression";

const getCalledFunctionName = (node: any) => {
  if (isFunctionCall(node)) {
    const rootCallee = deepGet<{ name?: string; property?: { name: string } }>(
      node,
      "callee"
    );
    const name =
      rootCallee.name ||
      deepGet<{ name?: string }>(rootCallee, "object").name ||
      deepGet<{ name?: string }>(rootCallee, "tag", "object").name;

    return name;
  }
  return "";
};

const isString = (node: any): node is StringLiteral => {
  return node.type === "StringLiteral";
};

const isAnIt = (expression: any) => {
  const name = getCalledFunctionName(expression);
  return name === "it" || name === "test" || name === "skip";
};

const isAnDescribe = (expression: any) => {
  return getCalledFunctionName(expression) === "describe";
};

type DescribeOrItNode = {
  start: number;
  end: number;
  name: string;
};

export class Parser {
  constructor(private readonly program: ProgramContext) {}

  private isDefaultExport(node: any) {
    return node.type === "ExportDefaultDeclaration";
  }

  private getName(node: any, parentName: string | undefined) {
    const args = deepGet<any[]>(node, "arguments");
    const [name] = args;

    if (name && isString(name)) {
      if (parentName) {
        return `${parentName} > ${name.value}`;
      }
      return name.value;
    }
  }

  private getPosition(node: any) {
    if (node.start != null && node.end != null) {
      return {
        start: node.start,
        end: node.end,
      };
    }
  }

  private getNestedCall(node: any) {
    const args = deepGet<any[]>(node, "arguments");
    const lastArg = args[args.length - 1];

    if (isFunctionDeclaration(lastArg)) {
      return { body: deepGet<Statement[]>(lastArg, "body") };
    }

    return;
  }

  private findDescribes(
    program: { body: Statement[] },
    parentName?: string
  ): DescribeOrItNode[] {
    const result: DescribeOrItNode[] = [];

    for (const statement of program.body) {
      const callExpression = this.isDefaultExport(statement)
        ? deepGet(statement, "declaration")
        : deepGet(statement, "expression");

      if (callExpression && isAnDescribe(callExpression)) {
        const nested = this.getNestedCall(callExpression);

        const name = this.getName(callExpression, parentName);
        const position = this.getPosition(callExpression);

        if (name && position) {
          result.push({
            name: name,
            ...position,
          });
        }

        if (nested) result.push(...this.findDescribes(nested, name));
      } else if (isAnIt(callExpression)) {
        const name = this.getName(callExpression, parentName);
        const position = this.getPosition(callExpression);

        if (name && position) {
          result.push({
            name: name,
            ...position,
          });
        }
      }
    }

    return result;
  }

  public parse(document: vscode.TextDocument) {
    const fileContent = document.getText();

    const plugins = this.program.config.get("parserPlugins", ["typescript"]);

    const ast = parser.parse(fileContent, {
      sourceType: "module",
      plugins,
      allowAwaitOutsideFunction: true,
      allowImportExportEverywhere: true,
      allowNewTargetOutsideFunction: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
      allowUndeclaredExports: true,
      attachComment: false,
      errorRecovery: true,
    });
    return this.findDescribes(ast.program);
  }
}
