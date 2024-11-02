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
}: FieldFactoryType<Value, Values, DynamicValues>) => {
  return makeAutoObservable<FieldType<Value>>(
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
      isTouched: false,
      get isDirty() {
        if (calculateIsDirty)
          return calculateIsDirty({
            current: this.value,
            init: this.init,
          });
        return this.value !== this.init;
      },
      errors: [],
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
      isValidating: false,
      *validate() {
        if (rules) {
          this.isTouched = true;
          this.errors = [];
          this.isValidating = true;

          const validationResults: boolean[] = yield Promise.all(
            rules.map(async (rule) => rule.validator(this.value, getValues())),
          );

          this.errors = validationResults.reduce<FieldErrorType[]>(
            (acc, value, index) => {
              if (!value) {
                const { name, errorText } = rules[index];
                acc.push({
                  name,
                  errorText,
                });
              }
              return acc;
            },
            [],
          );

          this.isValidating = false;
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
