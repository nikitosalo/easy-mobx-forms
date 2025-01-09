import { AnyValueType } from "./types.ts";

export type FieldErrorType = {
  name: string;
  errorText: string;
};

type ValidatorType<Value extends AnyValueType> = (value: Value) => boolean;

export type RuleType<Value extends AnyValueType> = {
  name: string;
  errorText: string;
  validator: ValidatorType<Value>;
};

export type ValidationEventType = "submit" | "blur" | "change";
