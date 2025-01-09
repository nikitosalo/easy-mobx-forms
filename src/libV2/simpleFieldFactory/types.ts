import {
  RuleType,
  ValidationEventType,
  FieldErrorType,
} from "../validationTypes.ts";
import { AnyValueType } from "../types.ts";

export type SimpleFieldConfigType<Value extends AnyValueType> = {
  init: Value;
  isDynamic?: false;
  rules?: RuleType<Value>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
};

export type SimpleFieldFactoryType<Value extends AnyValueType> = {
  config: SimpleFieldConfigType<Value>;
  name: string;
  formConfig: {
    validateOn: ValidationEventType[];
  };
};

export type SimpleFieldType<Value extends AnyValueType> = {
  name: string;
  readonly init: Value;
  value: Value;
  readonly validateEvents: Set<ValidationEventType>;
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
