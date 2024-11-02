type SimpleFieldConfigType<Value> = {
  value: Value;
};

type DynamicFieldConfigType<Value> = {
  value: Value;
  isDynamic: true;
};

type FieldConfigType<Value> =
  | SimpleFieldConfigType<Value>
  | DynamicFieldConfigType<Value>;

type AnyFieldsConfigType = {
  [key: string]: FieldConfigType<any>;
};

type ConfigType<Fields extends AnyFieldsConfigType> = {
  fields: {
    [K in keyof Fields]: Fields[K];
  };
};

type SimpleFieldType<Value> = {
  simpleValue: Value;
};

type DynamicFieldType<Value> = {
  dynamicValue: Value;
};

type ConditionalFieldType<
  FieldConfig extends FieldConfigType<FieldConfig["value"]>,
> =
  FieldConfig extends SimpleFieldConfigType<FieldConfig["value"]>
    ? SimpleFieldType<FieldConfig["value"]>
    : DynamicFieldType<FieldConfig["value"]>;

type FormType<Fields extends AnyFieldsConfigType> = {
  fields: {
    [K in keyof Fields]: ConditionalFieldType<Fields[K]>;
  };
};

const formFactory = <
  Fields extends AnyFieldsConfigType,
  // Values extends AnyValuesType<Fields>,
>(
  config: ConfigType<Fields>,
): FormType<Fields> => {
  return {
    fields: Object.getOwnPropertyNames(config.fields).reduce<
      FormType<Fields>["fields"]
    >((acc, key) => {
      acc[key] = config.fields[key];
      return acc;
    }, {}) as unknown as FormType<Fields>["fields"],
  };
};

const form = formFactory({
  fields: {
    simple: {
      value: "",
    },
    dynamic: {
      value: [3, ""],
      isDynamic: true,
    },
  },
});

const first = form.fields.simple.simpleValue;
const second = form.fields.dynamic.dynamicValue;
