import {
  RuleType,
  ValidationEventType,
  FieldErrorType,
  FieldValidateGeneratorType,
} from "../validationTypes.ts";
import { AnyValueType } from "../types.ts";
import { AnyFieldsConfigType, FormValuesType } from "../formFactory/types.ts";

export interface SimpleFieldConfigType<
  Value extends AnyValueType,
  Fields extends AnyFieldsConfigType,
> {
  init: Value;
  isDynamic?: false;
  rules?: RuleType<Value, Fields>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
}

export interface SimpleFieldFactoryType<
  Value extends AnyValueType,
  Fields extends AnyFieldsConfigType,
> {
  config: SimpleFieldConfigType<Value, Fields>;
  name: string;
  formConfig: {
    validateOn: ValidationEventType[];
    getValues: () => FormValuesType<Fields>;
  };
}

export interface SimpleFieldType<Value extends AnyValueType> {
  name: string;
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
  addError: (error: FieldErrorType) => void;
  readonly validateEvents: Set<ValidationEventType>;
  validate: () => FieldValidateGeneratorType;
  isValidating: boolean;
  isValid: boolean;
  readonly isDynamic: false;
}
