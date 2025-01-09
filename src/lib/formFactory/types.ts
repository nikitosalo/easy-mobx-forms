import { AnyValueType } from "../types.ts";
import {
  SimpleFieldConfigType,
  SimpleFieldType,
} from "../simpleFieldFactory/types.ts";
import {
  DynamicFieldConfigType,
  DynamicFieldType,
} from "../dynamicFieldFactory/types.ts";

export type FieldConfigType<Value> =
  | DynamicFieldConfigType<Value>
  | SimpleFieldConfigType<Value>;

export type AnyFieldsConfigType = {
  [key: string]: FieldConfigType<AnyValueType>;
};

export type FieldType<Field extends FieldConfigType<AnyValueType>> =
  Field extends DynamicFieldConfigType<Field["init"]>
    ? DynamicFieldType<Field["init"]>
    : SimpleFieldType<Field["init"]>;

export type FieldsType<Fields extends AnyFieldsConfigType> = {
  [K in keyof Fields]: FieldType<Fields[K]>;
};

export type FormConfigType<Fields extends AnyFieldsConfigType> = {
  fields: {
    [K in keyof Fields]: Fields[K];
  };
};

export type FormType<Fields extends AnyFieldsConfigType> = {
  fields: FieldsType<Fields>;
};
