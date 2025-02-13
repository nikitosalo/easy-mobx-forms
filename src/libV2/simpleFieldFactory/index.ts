import { SimpleFieldFactoryType, SimpleFieldType } from "./types.ts";
import { makeAutoObservable } from "mobx";
import { AnyValueType } from "../types.ts";
import { FieldErrorType } from "../../../lib/validationTypes.ts";
import { AnyFieldsConfigType } from "../formFactory/types.ts";

export const simpleFieldFactory = <
  Value extends AnyValueType,
  Fields extends AnyFieldsConfigType,
>({
  config: { init, validateOn = [], calculateIsDirty, rules },
  name,
  formConfig,
}: SimpleFieldFactoryType<Value, Fields>) => {
  return makeAutoObservable<SimpleFieldType<Value>>({
    name,
    init,
    value: init,
    validateEvents: new Set([...validateOn, ...formConfig.validateOn]),
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
          rules.map((rule) =>
            rule.validator(this.value, formConfig.getValues()),
          ),
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
    isDynamic: false,
  });
};
