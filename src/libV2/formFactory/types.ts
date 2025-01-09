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

export type FieldConfigType<Value extends AnyValueType> =
  | DynamicFieldConfigType<Value extends Array<AnyValueType> ? Value : never>
  | SimpleFieldConfigType<Value>;

export type AnyFieldsConfigType = {
  [key: string]: FieldConfigType<AnyValueType>;
};

export type FieldType<Field extends FieldConfigType<AnyValueType>> =
  Field["isDynamic"] extends true
    ? DynamicFieldType<
        Field["init"] extends Array<AnyValueType> ? Field["init"] : never
      >
    : SimpleFieldType<Field["init"]>;

export type FieldsType<Fields extends AnyFieldsConfigType> = {
  [K in keyof Fields]: FieldType<Fields[K]>;
};

export type FormConfigType<Fields extends AnyFieldsConfigType> = {
  fields: {
    [K in keyof Fields]: Fields[K];
  };
  validateOn?: ValidationEventType[];
};

export type FormType<Fields extends AnyFieldsConfigType> = {
  fields: FieldsType<Fields>;
  submit: () => void;
  reset: () => void;
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
};
