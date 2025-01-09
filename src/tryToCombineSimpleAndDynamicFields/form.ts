type AnySimpleValueType = number | string | boolean;
type AnyValueType = AnySimpleValueType | Array<AnySimpleValueType>;

type FieldConfigType<Value> =
    | {
          value: Value extends Array<AnyValueType> ? Value : never;
          isDynamic: true;
      }
    | {
          value: Value;
          isDynamic?: false;
      };

type AnyFieldsConfigType = {
    [key: string]: FieldConfigType<AnyValueType>;
};

type ConfigType<Fields> = {
    fields: {
        [K in keyof Fields]: Fields[K];
    };
};

type FormType<Fields> = ConfigType<Fields>;

const formFactory = <Fields extends AnyFieldsConfigType>(
    config: ConfigType<Fields>
) =>
    ({
        fields: Object.getOwnPropertyNames(config.fields).reduce(
            (acc, key) => ({
                ...acc,
                [key]: config.fields[key],
            }),
            {}
        ),
    }) as FormType<Fields>;

const form = formFactory({
    fields: {
        simple: {
            value: '',
        },
        dynamic: {
            value: [3],
            isDynamic: true,
        },
    },
});

export const first = form.fields.simple.value;
export const second = form.fields.dynamic.value;
