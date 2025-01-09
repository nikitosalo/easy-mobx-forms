import { FormConfigType, FormType, AnyFieldsConfigType } from "./types.ts";
import { dynamicFieldFactory } from "../dynamicFieldFactory";
import { simpleFieldFactory } from "../simpleFieldFactory";

export const formFactory = <Fields extends AnyFieldsConfigType>(
  config: FormConfigType<Fields>,
) =>
  ({
    fields: Object.getOwnPropertyNames(config.fields).reduce((acc, key) => {
      const fieldConfig = config.fields[key];

      return {
        ...acc,
        [key]: fieldConfig.isDynamic
          ? dynamicFieldFactory({
              config: fieldConfig,
            })
          : simpleFieldFactory({
              config: fieldConfig,
            }),
      };
    }, {}),
  }) as FormType<Fields>;

const form = formFactory({
  fields: {
    simple: {
      init: "",
    },
    dynamic: {
      init: [3, ""],
      isDynamic: true,
    },
  },
});

export const first = form.fields.simple.value;
export const second = form.fields.dynamic.values;
