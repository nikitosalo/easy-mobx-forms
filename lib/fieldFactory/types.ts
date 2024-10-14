import {
  RuleType,
  ValidationEventType,
  FieldErrorType,
} from "../validationTypes";
import { AnyValuesType, FormValuesType } from "../formFactory/types";

export type FieldFactoryType<
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  fieldName: string;
  fieldConfig: FieldConfigType<Value, Values, DynamicValues>;
  formConfig: {
    validateOn: ValidationEventType[];
  };
  getValues: () => FormValuesType<Values, DynamicValues>;
};

export type FieldConfigType<
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  init: Value;
  rules?: RuleType<Value, Values, DynamicValues>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
};

export type FieldType<Value> = {
  name: string;
  init: Value;
  value: Value;
  validateEvents: Set<ValidationEventType>;
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
