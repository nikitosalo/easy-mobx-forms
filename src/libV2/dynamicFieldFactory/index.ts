import {
  DynamicFieldFactoryType,
  DynamicFieldItemFactoryType,
  DynamicFieldItemType,
  DynamicFieldType,
} from "./types.ts";
import { makeAutoObservable } from "mobx";
import { AnyValueType } from "../types.ts";
import { FieldErrorType } from "../../../lib/validationTypes.ts";
import { AnyFieldsConfigType } from "../formFactory/types.ts";

const dynamicFieldItemFactory = <
  Value extends AnyValueType,
  Fields extends AnyFieldsConfigType,
>({
  init,
  validateEvents,
  calculateIsDirty,
  rules,
  getValues,
}: DynamicFieldItemFactoryType<Value, Fields>) => {
  return makeAutoObservable<DynamicFieldItemType<Value>>({
    id:
      window.crypto.randomUUID?.() ??
      window.crypto.getRandomValues(new Uint32Array([1]))[0].toString(),
    init,
    value: init,
    onChange(value: Value) {
      this.value = value;
      this.isTouched = true;

      if (validateEvents.has("change")) {
        this.validate();
      }
    },
    onBlur() {
      if (validateEvents.has("blur")) {
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
          rules.map((rule) => rule.validator(this.value, getValues())),
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
  });
};

export const dynamicFieldFactory = <
  Values extends AnyValueType[],
  Fields extends AnyFieldsConfigType,
>({
  config: { init, rules, validateOn = [], calculateIsDirty },
  name,
  formConfig,
}: DynamicFieldFactoryType<Values, Fields>) => {
  const validateEvents = new Set([...validateOn, ...formConfig.validateOn]);

  const createFieldItems = () =>
    init.map((init) =>
      dynamicFieldItemFactory({
        init,
        rules,
        validateEvents,
        calculateIsDirty,
        getValues: formConfig.getValues,
      }),
    );

  return makeAutoObservable<DynamicFieldType<Values>>({
    name,
    items: createFieldItems(),
    addFieldItem(init: Values[number]) {
      this.items.push(
        dynamicFieldItemFactory({
          init,
          rules,
          validateEvents,
          calculateIsDirty,
          getValues: formConfig.getValues,
        }),
      );
    },
    deleteFieldItem(id: string) {
      const findIndex = this.items.findIndex((item) => item.id === id);
      this.items.splice(findIndex, 1);
    },
    get values() {
      const values: Values[number][] = [];
      for (const item of this.items) {
        values.push(item.value);
      }
      return values;
    },
    reset() {
      this.items = createFieldItems();
    },
    validateEvents,
    *validate() {
      yield Promise.all(this.items.map((item) => item.validate()));
    },
    get isValidating() {
      for (const item of this.items) {
        if (item.isValidating) return true;
      }
      return false;
    },
    get isDirty() {
      for (const item of this.items) {
        if (item.isDirty) return true;
      }
      return false;
    },
    get isTouched() {
      for (const item of this.items) {
        if (item.isTouched) return true;
      }
      return false;
    },
    get isValid() {
      for (const item of this.items) {
        if (!item.isValid) return false;
      }
      return true;
    },
    isDynamic: true,
  });
};
