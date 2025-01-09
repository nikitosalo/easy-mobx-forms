import { AnyValueType } from "../types.ts";
import { RuleType, ValidationEventType } from "../validationTypes.ts";

export type DynamicFieldConfigType<Value> = {
  init: Value extends Array<AnyValueType> ? Value : never;
  isDynamic: true;
  rules?: RuleType<Value>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
};

export type DynamicFieldFactoryType<Value> = {
  config: DynamicFieldConfigType<Value>;
};

export type DynamicFieldType<Value> = {
  name: string;
  values: Value;
};
