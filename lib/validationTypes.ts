import { AnyValuesType, FormValuesType } from "./formFactory/types";

export type FieldErrorType = {
  name: string;
  errorText: string;
};

type ValidatorType<
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = (value: Value, values: FormValuesType<Values, DynamicValues>) => boolean;

export type RuleType<
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  name: string;
  errorText: string;
  validator: ValidatorType<Value, Values, DynamicValues>;
};

export type ValidationEventType = "submit" | "blur" | "change";
