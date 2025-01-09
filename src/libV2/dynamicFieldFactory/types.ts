import { AnyValueType } from "../types.ts";
import { RuleType, ValidationEventType } from "../validationTypes.ts";
import { FieldErrorType } from "../../../lib/validationTypes.ts";

export type DynamicFieldConfigType<Value extends Array<AnyValueType>> = {
  init: Value;
  isDynamic: true;
  rules?: RuleType<Value[number]>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: {
    init: Value[number];
    current: Value[number];
  }) => boolean;
};

export type DynamicFieldFactoryType<Value extends Array<AnyValueType>> = {
  config: DynamicFieldConfigType<Value>;
  name: string;
  formConfig: {
    validateOn: ValidationEventType[];
  };
};

export type DynamicFieldItemFactoryType<Value extends AnyValueType> = {
  init: Value;
  validateEvents: Set<ValidationEventType>;
  rules?: RuleType<Value>[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
};

export type DynamicFieldItemType<Value extends AnyValueType> = {
  id: string;
  readonly init: Value;
  value: Value;
  onChange: (value: Value) => void;
  onBlur: () => void;
  isTouched: boolean;
  isDirty: boolean;
  errors: FieldErrorType[];
  firstError: FieldErrorType | null;
  resetErrors: () => void;
  reset: () => void;
  validate: () => void;
  addError: (error: FieldErrorType) => void;
  isValid: boolean;
};

export type DynamicFieldType<Values extends Array<AnyValueType>> = {
  name: string;
  items: DynamicFieldItemType<Values[number]>[];
  addFieldItem: (init: Values[number]) => void;
  deleteFieldItem: (id: string) => void;
  values: Values[number][];
  reset: () => void;
  readonly validateEvents: Set<ValidationEventType>;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
};
