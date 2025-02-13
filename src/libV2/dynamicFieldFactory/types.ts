import { AnyValueType } from "../types.ts";
import {
  DynamicFieldValidateGeneratorType,
  FieldValidateGeneratorType,
  RuleType,
  ValidationEventType,
  FieldErrorType,
} from "../validationTypes.ts";
import { AnyFieldsConfigType, FormValuesType } from "../formFactory/types.ts";

export interface DynamicFieldConfigType<
  Value extends Array<AnyValueType>,
  Fields extends AnyFieldsConfigType,
> {
  init: Value;
  isDynamic: true;
  rules?: RuleType<Value[number], Fields>[];
  validateOn?: ValidationEventType[];
  calculateIsDirty?: (params: {
    init: Value[number];
    current: Value[number];
  }) => boolean;
}

export interface DynamicFieldFactoryType<
  Value extends Array<AnyValueType>,
  Fields extends AnyFieldsConfigType,
> {
  config: DynamicFieldConfigType<Value, Fields>;
  name: string;
  formConfig: {
    validateOn: ValidationEventType[];
    getValues: () => FormValuesType<Fields>;
  };
}

export interface DynamicFieldItemFactoryType<
  Value extends AnyValueType,
  Fields extends AnyFieldsConfigType,
> {
  init: Value;
  validateEvents: Set<ValidationEventType>;
  rules?: RuleType<Value, Fields>[];
  calculateIsDirty?: (params: { init: Value; current: Value }) => boolean;
  getValues: () => FormValuesType<Fields>;
}

export interface DynamicFieldItemType<Value extends AnyValueType> {
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
  addError: (error: FieldErrorType) => void;
  validate: () => FieldValidateGeneratorType;
  isValidating: boolean;
  isValid: boolean;
}

export interface DynamicFieldType<Values extends Array<AnyValueType>> {
  name: string;
  items: DynamicFieldItemType<Values[number]>[];
  addFieldItem: (init: Values[number]) => void;
  deleteFieldItem: (id: string) => void;
  values: Values[number][];
  reset: () => void;
  isTouched: boolean;
  isDirty: boolean;
  readonly validateEvents: Set<ValidationEventType>;
  validate: () => DynamicFieldValidateGeneratorType;
  isValidating: boolean;
  isValid: boolean;
  readonly isDynamic: true;
}
