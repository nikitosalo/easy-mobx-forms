import { ValidationEventType } from "../validationTypes";
import { FieldConfigType, FieldType } from "../fieldFactory/types";
import {
  DynamicFieldConfigType,
  DynamicFieldType,
} from "../dynamicFieldFactory/types";

export type AnyValuesType = {
  [key: string]: any;
};

export type AnyFieldsType = {
  [key: string]: FieldType<any>;
};

export type FieldsType<Values extends AnyValuesType> = {
  [K in keyof Values]: FieldType<Values[K]>;
};

export type DynamicAnyFieldsType = {
  [key: string]: DynamicFieldType<any>;
};

export type DynamicFieldsType<Values extends DynamicAnyFieldsType> = {
  [K in keyof Values]: DynamicFieldType<Values[K]>;
};

type DynamicFieldsValuesType<Values extends AnyValuesType> = {
  [K in keyof Values]: Values[K][];
};

export type FormValuesType<
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  fieldsValues: Values;
  dynamicFieldsValues: DynamicFieldsValuesType<DynamicValues>;
};

type FieldConfigsType<
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  [K in keyof Values]: FieldConfigType<Values[K], Values, DynamicValues>;
};

type DynamicFieldConfigsType<
  DynamicValues extends AnyValuesType,
  Values extends AnyValuesType,
> = {
  [K in keyof DynamicValues]: DynamicFieldConfigType<
    DynamicValues[K],
    Values,
    DynamicValues
  >;
};

export type FormConfigType<
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  fields: FieldConfigsType<Values, DynamicValues>;
  dynamicFields?: DynamicFieldConfigsType<DynamicValues, Values>;
  validateOn?: ValidationEventType[];
};

export type FormType<
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  fields: FieldsType<Values>;
  dynamicFields: DynamicFieldsType<DynamicValues>;
  values: FormValuesType<Values, DynamicValues>;
  submit: () => void;
  reset: () => void;
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
};
