import { FormConfigType, FormType, AnyFieldsConfigType } from "./types.ts";
import { dynamicFieldFactory } from "../dynamicFieldFactory";
import { simpleFieldFactory } from "../simpleFieldFactory";
import { makeAutoObservable } from "mobx";
import { DynamicFieldConfigType } from "../dynamicFieldFactory/types.ts";
import { AnyValueType, AnyValuesType } from "../types.ts";
import { SimpleFieldConfigType } from "../simpleFieldFactory/types.ts";
import {
  DynamicFieldValidateGeneratorType,
  FieldValidateGeneratorType,
} from "../validationTypes.ts";

export const formFactory = <Fields extends AnyFieldsConfigType>(
  config: FormConfigType<Fields>,
) => {
  const formValidateOn = config.validateOn ?? [];
  const fields = {} as FormType<Fields>["fields"];

  const getValues = () => {
    const fieldsValues: AnyValuesType = {};

    for (const fieldName of Object.getOwnPropertyNames(fields)) {
      if (fields[fieldName]) {
        const field = fields[fieldName];
        if (field.isDynamic) fieldsValues[fieldName] = field.values;
        else fieldsValues[field.name] = field.value;
      }
    }

    return fieldsValues as FormType<Fields>["values"];
  };

  return makeAutoObservable<FormType<Fields>>({
    fields: Object.getOwnPropertyNames(config.fields).reduce((acc, name) => {
      const fieldConfig = config.fields[name];

      return {
        ...acc,
        [name]: fieldConfig.isDynamic
          ? dynamicFieldFactory({
              config: fieldConfig as DynamicFieldConfigType<
                AnyValueType[],
                AnyFieldsConfigType
              >,
              name,
              formConfig: {
                validateOn: formValidateOn,
                getValues,
              },
            })
          : simpleFieldFactory({
              config: fieldConfig as SimpleFieldConfigType<
                AnyValueType,
                AnyFieldsConfigType
              >,
              name,
              formConfig: {
                validateOn: formValidateOn,
                getValues,
              },
            }),
      };
    }, fields),
    get values() {
      return getValues();
    },
    *submit() {
      const validators: (() =>
        | FieldValidateGeneratorType
        | DynamicFieldValidateGeneratorType)[] = [];
      for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
        if (!this.fields[fieldName].validateEvents.has("submit")) return;

        validators.push(this.fields[fieldName].validate);
      }
      yield Promise.all(validators.map((validator) => validator()));

      if (config.afterSubmit && this.isValid) {
        config.afterSubmit(this.values);
      }
    },
    reset() {
      for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
        const field = this.fields[fieldName];
        field.reset();
      }
    },
    get isValid() {
      for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
        if (!this.fields[fieldName].isValid) {
          return false;
        }
      }
      return true;
    },
    get isTouched() {
      for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
        if (this.fields[fieldName].isTouched) {
          return true;
        }
      }
      return false;
    },
    get isDirty() {
      for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
        if (this.fields[fieldName].isDirty) {
          return true;
        }
      }

      return false;
    },
  });
};
