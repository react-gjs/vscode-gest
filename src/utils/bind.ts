export const Bind = (
  originalMethod: Function,
  context: ClassMethodDecoratorContext
) => {
  context.addInitializer(function (this: any) {
    this[context.name] = originalMethod.bind(this);
  });
};
