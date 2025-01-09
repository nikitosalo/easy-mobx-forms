export type FieldErrorType = {
  name: string;
  errorText: string;
};

type ValidatorType<Value> = (value: Value) => boolean;

export type RuleType<Value> = {
  name: string;
  errorText: string;
  validator: ValidatorType<Value>;
};

export type ValidationEventType = "submit" | "blur" | "change";
