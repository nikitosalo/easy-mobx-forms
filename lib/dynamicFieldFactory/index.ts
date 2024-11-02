import {
  DynamicFieldFactoryType,
  DynamicFieldItemFactoryType,
  DynamicFieldItemType,
  DynamicFieldType,
} from "./types";
import { makeAutoObservable } from "mobx";
import { FieldErrorType, ValidationEventType } from "../validationTypes";
import { AnyValuesType } from "../formFactory/types";

const dynamicFieldItemFactory = <
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
>({
  init,
  field,
  rules,
  calculateIsDirty,
  getValues,
}: DynamicFieldItemFactoryType<
  Value,
  Values,
  DynamicValues
>): DynamicFieldItemType<Value> => {
  const fieldItem: DynamicFieldItemType<Value> = {
    id:
      window.crypto.randomUUID?.() ??
      window.crypto.getRandomValues(new Uint32Array([1]))[0].toString(),
    init,
    value: init,
    onChange(value: Value) {
      this.value = value;
      this.isTouched = true;

      if (field.validateEvents.has("change")) {
        this.validate();
      }
    },
    onBlur() {
      if (field.validateEvents.has("blur")) {
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
    deleteFieldItem() {
      const findIndex = field.items.findIndex(
        (item) => item.id === fieldItem.id,
      );
      field.items.splice(findIndex, 1);
    },
  };

  return makeAutoObservable(fieldItem, {}, { autoBind: true });
};

export const dynamicFieldFactory = <
  Value,
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
>({
  fieldName,
  fieldConfig: { init, validateOn = [], rules, calculateIsDirty },
  formConfig,
  getValues,
}: DynamicFieldFactoryType<Value, Values, DynamicValues>) => {
  const field = makeAutoObservable<DynamicFieldType<Value>>(
    {
      name: fieldName,
      items: [] as DynamicFieldItemType<Value>[],
      validateEvents: new Set<ValidationEventType>([
        ...validateOn,
        ...formConfig.validateOn,
      ]),
      get values() {
        const values: Value[] = [];
        for (const item of this.items) {
          values.push(item.value);
        }
        return values;
      },
      isValidating: false,
      *validate() {
        this.isValidating = true;
        yield Promise.all(this.items.map(async (item) => item.validate()));
        this.isValidating = false;
      },
      reset() {
        this.items = init.map((init) =>
          dynamicFieldItemFactory({
            init,
            field,
            rules,
            calculateIsDirty,
            getValues,
          }),
        );
      },
      addFieldItem(init: Value) {
        this.items.push(
          dynamicFieldItemFactory({
            init,
            field: this,
            rules,
            calculateIsDirty,
            getValues,
          }),
        );
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
    },
    {},
    { autoBind: true },
  );

  init.forEach((init) => {
    field.items.push(
      dynamicFieldItemFactory({
        init,
        field,
        rules,
        calculateIsDirty,
        getValues,
      }),
    );
  });

  return field;
};
