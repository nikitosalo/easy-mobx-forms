import { SimpleFieldFactoryType, SimpleFieldType } from "./types.ts";
import { makeAutoObservable } from "mobx";
import { AnyValueType } from "../types.ts";

export const simpleFieldFactory = <Value extends AnyValueType>({
  config: { init, validateOn = [], calculateIsDirty, rules },
  name,
  formConfig,
}: SimpleFieldFactoryType<Value>) => {
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
    validate() {
      if (rules) {
        this.isTouched = true;
        this.errors = [];

        rules.forEach((rule) => {
          if (!rule.validator(this.value)) {
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
  });
};
