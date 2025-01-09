type AnyPrimitiveValueType = number | string | boolean;

interface AnyObjectValueType {
  [key: string]: unknown;
}

type AnySimpleValueType = AnyPrimitiveValueType | AnyObjectValueType;
export type AnyValueType = AnySimpleValueType | Array<AnySimpleValueType>;
export interface AnyValuesType {
  [key: string]: AnyValueType | Array<AnyValueType>;
}
