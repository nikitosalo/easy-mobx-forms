import { AnyValueType } from "../types.ts";
import {
  SimpleFieldConfigType,
  SimpleFieldType,
} from "../simpleFieldFactory/types.ts";
import {
  DynamicFieldConfigType,
  DynamicFieldType,
} from "../dynamicFieldFactory/types.ts";
import { ValidationEventType } from "../validationTypes.ts";

export type FieldConfigType<
  Value extends AnyValueType,
  Fields extends AnyFieldsConfigType,
> =
  | DynamicFieldConfigType<
      Value extends Array<AnyValueType> ? Value : never,
      Fields
    >
  | SimpleFieldConfigType<Value, Fields>;

export interface AnyFieldsConfigType {
  [key: string]: FieldConfigType<AnyValueType, AnyFieldsConfigType>;
}

export type FieldType<
  Field extends FieldConfigType<AnyValueType, AnyFieldsConfigType>,
> = Field["isDynamic"] extends true
  ? DynamicFieldType<
      Field["init"] extends Array<AnyValueType> ? Field["init"] : never
    >
  : SimpleFieldType<Field["init"]>;

export type FieldsType<Fields extends AnyFieldsConfigType> = {
  [K in keyof Fields]: FieldType<Fields[K]>;
};

export interface FormConfigType<Fields extends AnyFieldsConfigType> {
  fields: {
    [K in keyof Fields]: Fields[K];
  };
  validateOn?: ValidationEventType[];
  afterSubmit?: (values: FormValuesType<Fields>) => void | Promise<void>;
}

export type FormValuesType<Fields extends AnyFieldsConfigType> = {
  [K in keyof Fields]: Fields[K]["init"];
};

export interface FormType<Fields extends AnyFieldsConfigType> {
  fields: FieldsType<Fields>;
  values: FormValuesType<Fields>;
  submit: () => void;
  reset: () => void;
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
}
