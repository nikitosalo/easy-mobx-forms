import { AnyFieldsConfigType, FormValuesType } from "./formFactory/types.ts";

export interface FieldErrorType {
  name: string;
  errorText: string;
}

type ValidatorType<Value, Fields extends AnyFieldsConfigType> = (
  value: Value,
  values: FormValuesType<Fields>,
) => boolean | Promise<boolean>;

export interface RuleType<Value, Fields extends AnyFieldsConfigType> {
  name: string;
  errorText: string;
  validator: ValidatorType<Value, Fields>;
}

export type ValidationEventType = "submit" | "blur" | "change";

export type FieldValidateGeneratorType = Generator<
  Promise<boolean[]>,
  void,
  boolean[]
>;

export type DynamicFieldValidateGeneratorType = Generator<
  Promise<FieldValidateGeneratorType[]>,
  void,
  unknown
>;
