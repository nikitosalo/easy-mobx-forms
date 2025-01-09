import { RuleType, ValidationEventType } from "../validationTypes.ts";

export type SimpleFieldConfigType<Value> = {
  init: Value;
  isDynamic?: false;
  rules?: RuleType<Value>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
};

export type SimpleFieldFactoryType<Value> = {
  config: SimpleFieldConfigType<Value>;
};

export type SimpleFieldType<Value> = {
  value: Value;
};
