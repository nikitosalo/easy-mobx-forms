import { SimpleFieldFactoryType, SimpleFieldType } from "./types.ts";

export const simpleFieldFactory = <Value>({
  config: { init },
}: SimpleFieldFactoryType<Value>): SimpleFieldType<Value> => ({
  value: init,
});
