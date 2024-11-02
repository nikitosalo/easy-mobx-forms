import { fieldFactory } from "../fieldFactory";
import { dynamicFieldFactory } from "../dynamicFieldFactory";
import { makeAutoObservable } from "mobx";
import {
  FormType,
  FormConfigType,
  FormValuesType,
  AnyValuesType,
  DynamicAnyFieldsType,
  AnyFieldsType,
  DynamicFieldsType,
  FieldsType,
} from "./types";
import {
  DynamicFieldValidateGeneratorType,
  FieldValidateGeneratorType,
} from "../validationTypes.ts";

export const formFactory = <
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
>(
  config: FormConfigType<Values, DynamicValues>,
) => {
  const fields: AnyFieldsType = {};
  const dynamicFields: DynamicAnyFieldsType = {};

  const getValues = ({
    fields,
    dynamicFields,
  }: {
    fields: FieldsType<Values>;
    dynamicFields: DynamicFieldsType<DynamicValues>;
  }) => {
    const fieldsValues: AnyValuesType = {};

    for (const fieldName of Object.getOwnPropertyNames(fields)) {
      if (fields[fieldName]) {
        const field = fields[fieldName];
        fieldsValues[field.name] = field.value;
      }
    }

    const dynamicFieldsValues: AnyValuesType = {};

    for (const fieldName of Object.getOwnPropertyNames(dynamicFields)) {
      const field = dynamicFields[fieldName];
      dynamicFieldsValues[field.name] = field.values;
    }

    return {
      fieldsValues,
      dynamicFieldsValues,
    } as FormValuesType<Values, DynamicValues>;
  };

  const {
    fields: fieldsConfigs,
    dynamicFields: dynamicFieldsConfigs,
    validateOn = [],
    afterSubmit,
  } = config;
  for (const fieldName of Object.getOwnPropertyNames(fieldsConfigs)) {
    const fieldConfig = fieldsConfigs[fieldName];
    fields[fieldName] = fieldFactory({
      fieldName,
      fieldConfig,
      formConfig: {
        validateOn,
      },
      getValues: () =>
        getValues({
          fields: fields as FieldsType<Values>,
          dynamicFields: dynamicFields as DynamicFieldsType<DynamicValues>,
        }),
    });
  }
  if (dynamicFieldsConfigs) {
    for (const fieldName of Object.getOwnPropertyNames(dynamicFieldsConfigs)) {
      const fieldConfig = dynamicFieldsConfigs[fieldName];
      dynamicFields[fieldName] = dynamicFieldFactory({
        fieldName,
        fieldConfig,
        formConfig: {
          validateOn,
        },
        getValues: () =>
          getValues({
            fields: fields as FieldsType<Values>,
            dynamicFields: dynamicFields as DynamicFieldsType<DynamicValues>,
          }),
      });
    }
  }

  return makeAutoObservable<FormType<Values, DynamicValues>>(
    {
      fields: fields as FieldsType<Values>,
      dynamicFields: dynamicFields as DynamicFieldsType<DynamicValues>,
      get values() {
        return getValues({
          fields: this.fields,
          dynamicFields: this.dynamicFields,
        });
      },
      isValidating: false,
      *submit() {
        this.isValidating = true;
        const validators: (() =>
          | FieldValidateGeneratorType
          | DynamicFieldValidateGeneratorType)[] = [];
        for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
          if (!this.fields[fieldName].validateEvents.has("submit")) return;

          validators.push(this.fields[fieldName].validate);
        }

        if (dynamicFieldsConfigs) {
          for (const fieldName of Object.getOwnPropertyNames(
            this.dynamicFields,
          )) {
            if (!this.dynamicFields[fieldName].validateEvents.has("submit"))
              return;

            validators.push(this.dynamicFields[fieldName].validate);
          }
        }

        yield Promise.all(validators.map(async (validator) => validator()));
        this.isValidating = false;

        if (this.isValid && afterSubmit) {
          yield afterSubmit(this.values);
        }
      },
      reset() {
        for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
          const field = this.fields[fieldName];
          field.reset();
        }

        for (const fieldName of Object.getOwnPropertyNames(
          this.dynamicFields,
        )) {
          const field = this.dynamicFields[fieldName];
          field.reset();
        }
      },
      get isValid() {
        for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
          if (!this.fields[fieldName].isValid) {
            return false;
          }
        }

        for (const fieldName of Object.getOwnPropertyNames(
          this.dynamicFields,
        )) {
          if (!this.dynamicFields[fieldName].isValid) {
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

        for (const fieldName of Object.getOwnPropertyNames(
          this.dynamicFields,
        )) {
          if (this.dynamicFields[fieldName].isTouched) {
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

        for (const fieldName of Object.getOwnPropertyNames(
          this.dynamicFields,
        )) {
          if (this.dynamicFields[fieldName].isDirty) {
            return true;
          }
        }

        return false;
      },
    },
    {},
    {
      autoBind: true,
    },
  );
};
