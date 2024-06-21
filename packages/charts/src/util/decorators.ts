export function Debounce(delay: number): MethodDecorator {
  return function (
    _target: any,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    let timeout: any = null;

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => originalMethod.apply(this, args), delay);
    };

    return descriptor;
  };
}
