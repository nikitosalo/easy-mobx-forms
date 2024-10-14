import { makeAutoObservable } from "mobx";
import { FieldFactoryType, FieldType } from "./types";
import { FieldErrorType, ValidationEventType } from "../validationTypes";
import { AnyValuesType } from "../formFactory/types";

export const fieldFactory = <
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
>({
  fieldName,
  fieldConfig: { init, rules, validateOn = [], calculateIsDirty },
  formConfig,
  getValues,
}: FieldFactoryType<Value, Values, DynamicValues>): FieldType<Value> => {
  return makeAutoObservable(
    {
      name: fieldName,
      init,
      value: init,
      validateEvents: new Set<ValidationEventType>([
        ...validateOn,
        ...formConfig.validateOn,
      ]),
      onChange(value: Value) {
        this.value = value;
        this.isTouched = true;

        if (this.validateEvents.has("change")) {
          this.validate();
        }
      },
      onBlur() {
        if (this.validateEvents.has("blur")) {
          this.validate();
        }
      },
      isTouched: false as boolean,
      get isDirty() {
        if (calculateIsDirty)
          return calculateIsDirty({
            current: this.value,
            init: this.init,
          });
        return this.value !== this.init;
      },
      errors: [] as FieldErrorType[],
      get firstError() {
        return this.errors.length ? this.errors[0] : null;
      },
      resetErrors() {
        this.errors = [];
      },
      reset() {
        this.errors = [];
        this.value = this.init;
        this.isTouched = false;
      },
      validate() {
        if (rules) {
          this.isTouched = true;
          this.errors = [];

          rules.forEach((rule) => {
            if (!rule.validator(this.value, getValues())) {
              this.errors.push({
                name: rule.name,
                errorText: rule.errorText,
              });
            }
          });
        }
      },
      addError(error) {
        this.errors.push(error);
      },
      get isValid() {
        return !this.errors.length;
      },
    },
    {},
    { autoBind: true },
  );
};
