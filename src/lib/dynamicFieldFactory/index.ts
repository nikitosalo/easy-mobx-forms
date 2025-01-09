import { DynamicFieldFactoryType } from "./types.ts";

export const dynamicFieldFactory = <Value>({
  config: { init },
}: DynamicFieldFactoryType<Value>) => ({
  value: init,
});
