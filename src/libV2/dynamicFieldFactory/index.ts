import {
  DynamicFieldFactoryType,
  DynamicFieldItemFactoryType,
  DynamicFieldItemType,
  DynamicFieldType,
} from "./types.ts";
import { makeAutoObservable } from "mobx";
import { AnyValueType } from "../types.ts";

const dynamicFieldItemFactory = <Value extends AnyValueType>({
  init,
  validateEvents,
  calculateIsDirty,
  rules,
}: DynamicFieldItemFactoryType<Value>) => {
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

export const dynamicFieldFactory = <Values extends AnyValueType[]>({
  config: { init, rules, validateOn = [], calculateIsDirty },
  name,
  formConfig,
}: DynamicFieldFactoryType<Values>) => {
  const validateEvents = new Set([...validateOn, ...formConfig.validateOn]);

  const createFieldItems = () =>
    init.map((init) =>
      dynamicFieldItemFactory({
        init,
        rules,
        validateEvents,
        calculateIsDirty,
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
  });
};
