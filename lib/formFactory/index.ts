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

export const formFactory = <
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
>(
  config: FormConfigType<Values, DynamicValues>,
): FormType<Values, DynamicValues> => {
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

    for (const fieldName in Object.getOwnPropertyNames(fields)) {
      const field = fields[fieldName];
      fieldsValues[field.name] = field.value;
    }

    const dynamicFieldsValues: AnyValuesType = {};

    for (const fieldName in Object.getOwnPropertyNames(dynamicFields)) {
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

  return makeAutoObservable(
    {
      fields: fields as FieldsType<Values>,
      dynamicFields: dynamicFields as DynamicFieldsType<DynamicValues>,
      get values() {
        return getValues({
          fields: this.fields,
          dynamicFields: this.dynamicFields,
        });
      },
      submit() {
        for (const fieldName of Object.getOwnPropertyNames(this.fields)) {
          if (this.fields[fieldName].validateEvents.has("submit")) {
            const field = this.fields[fieldName];
            field.validate();
          }
        }

        if (dynamicFieldsConfigs) {
          for (const fieldName of Object.getOwnPropertyNames(
            this.dynamicFields,
          )) {
            if (this.dynamicFields[fieldName].validateEvents.has("submit")) {
              const field = this.dynamicFields[fieldName];
              field.items.forEach((item) => {
                item.validate();
              });
            }
          }
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
