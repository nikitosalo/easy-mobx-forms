import {
  DynamicFieldValidateGeneratorType,
  FieldErrorType,
  FieldValidateGeneratorType,
  RuleType,
  ValidationEventType,
} from "../validationTypes";
import { AnyValuesType, FormValuesType } from "../formFactory/types";

export type DynamicFieldItemFactoryType<
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  init: Value;
  field: DynamicFieldType<Value>;
  rules?: RuleType<Value, Values, DynamicValues>[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
  getValues: () => FormValuesType<Values, DynamicValues>;
};

export type DynamicFieldConfigType<
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  init: Value[];
  rules?: RuleType<Value, Values, DynamicValues>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
};

export type DynamicFieldFactoryType<
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  fieldName: string;
  fieldConfig: {
    init: Value[];
    rules?: RuleType<Value, Values, DynamicValues>[];
    validateOn?: ValidationEventType[];
    calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
  };
  formConfig: {
    validateOn: ValidationEventType[];
  };
  getValues: () => FormValuesType<Values, DynamicValues>;
};

export type DynamicFieldItemType<Value> = {
  id: string;
  init: Value;
  value: Value;
  onChange: (value: Value) => void;
  onBlur: () => void;
  isTouched: boolean;
  isDirty: boolean;
  errors: FieldErrorType[];
  firstError: FieldErrorType | null;
  resetErrors: () => void;
  reset: () => void;
  validate: () => FieldValidateGeneratorType;
  addError: (error: FieldErrorType) => void;
  isValid: boolean;
  isValidating: boolean;
  deleteFieldItem: () => void;
};

export type DynamicFieldType<Value> = {
  name: string;
  values: Value[];
  validate: () => DynamicFieldValidateGeneratorType;
  validateEvents: Set<ValidationEventType>;
  items: DynamicFieldItemType<Value>[];
  reset: () => void;
  addFieldItem: (init: Value) => void;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  isValidating: boolean;
};
