type AnyPrimitiveValue = number | string | boolean;

type AnyObjectValue = Record<string, unknown>;

type AnySimpleValueType = AnyPrimitiveValue | AnyObjectValue;
export type AnyValueType = AnySimpleValueType | Array<AnySimpleValueType>;
