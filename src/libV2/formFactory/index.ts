import { FormConfigType, FormType, AnyFieldsConfigType } from "./types.ts";
import { dynamicFieldFactory } from "../dynamicFieldFactory";
import { simpleFieldFactory } from "../simpleFieldFactory";
import { makeAutoObservable } from "mobx";
import { DynamicFieldConfigType } from "../dynamicFieldFactory/types.ts";
import { AnyValueType } from "../types.ts";
import { SimpleFieldType } from "../simpleFieldFactory/types.ts";

export const formFactory = <Fields extends AnyFieldsConfigType>(
  config: FormConfigType<Fields>,
) => {
  const formValidateOn = config.validateOn ?? [];

  return makeAutoObservable<FormType<Fields>>({
    fields: Object.getOwnPropertyNames(config.fields).reduce(
      (acc, name) => {
        const fieldConfig = config.fields[name];

        return {
          ...acc,
          [name]: fieldConfig.isDynamic
            ? dynamicFieldFactory({
                config: fieldConfig as DynamicFieldConfigType<AnyValueType[]>,
                name,
                formConfig: {
                  validateOn: formValidateOn,
                },
              })
            : simpleFieldFactory({
                config: fieldConfig as SimpleFieldType<AnyValueType>,
                name,
                formConfig: {
                  validateOn: formValidateOn,
                },
              }),
        };
      },
      {} as FormType<Fields>["fields"],
    ),
    submit() {},
    reset() {},
    get isValid() {
      return false;
    },
    get isTouched() {
      return false;
    },
    get isDirty() {
      return false;
    },
  });
};

const form = formFactory({
  fields: {
    simple: {
      init: [""],
      calculateIsDirty: ({ init, current }) => init !== current,
      rules: [
        {
          name: "required",
          errorText: "required",
          validator: (value) => {
            return Boolean(value);
          },
        },
      ],
    },
    dynamic: {
      init: [
        3,
        {
          test: "test",
        },
      ],
      isDynamic: true,
      rules: [
        {
          name: "required",
          errorText: "required",
          validator: (value) => {
            return Boolean(value);
          },
        },
      ],
    },
  },
});

export const first = form.fields.simple.value;
export const second = form.fields.dynamic.values;
