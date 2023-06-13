import type { Commands } from "./commands";

export type CommandsMetadata = Array<{
  cmdId: string;
  method: (...args: any[]) => any;
}>;

const addMethod = (
  command: Commands,
  cmdID: string,
  method: (...args: any[]) => any
) => {
  let commandsList: undefined | CommandsMetadata = Reflect.getMetadata(
    "vscode:commands",
    command
  );

  if (!commandsList) {
    commandsList = [];
    Reflect.defineMetadata("vscode:commands", commandsList, command);
  }

  commandsList.push({ cmdId: cmdID, method });
};

export const getAllMethod = (command: Commands) => {
  const commandsList: undefined | CommandsMetadata = Reflect.getMetadata(
    "vscode:commands",
    command
  );

  return commandsList ?? [];
};

export const Register =
  () =>
  (
    originalMethod: Function,
    context: ClassMethodDecoratorContext<Commands>
  ) => {
    const methodName = context.name as keyof Commands;
    const cmdId = `gest.${methodName}`;

    context.addInitializer(function (this: Commands) {
      const method = originalMethod.bind(this);
      Object.defineProperty(this, methodName, {
        value: method,
      });
      addMethod(this, cmdId, method);
    });
  };
