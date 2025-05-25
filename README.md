# Mobx Forms

Легковесная библиотека управления формами для mobx приложений с поддержкой TypeScript

## Установка

```bash
npm install easy-mobx-forms
# or
yarn add easy-mobx-forms
```

## Простой пример формы логина

```typescript
import { observer } from 'mobx-react';
import { formFactory } from 'easy-mobx-forms';

const form = formFactory({
  fields: {
    username: {
      init: '',
      rules: [
        {
          name: 'required',
          errorText: 'Username is required',
          validator: (value) => Boolean(value),
        },
      ],
    },
    password: {
      init: '',
      rules: [
        {
          name: 'required',
          errorText: 'Password is required',
          validator: (value) => Boolean(value),
        },
        {
          name: 'minLength',
          errorText: 'Password must be at least 8 characters',
          validator: (value) => value.length >= 8,
        },
      ],
    },
  },
  validateOn: ['submit'],
});

export const LoginForm = observer(() => {
  const { submit, fields, isValidating } = form;

  return (
    <form onSubmit={submit}>
      <input
        value={fields.username.value}
        onChange={(e) => fields.username.onChange(e.target.value)}
        onBlur={fields.username.onBlur}
      />
      {fields.username.firstError && (
        <div>{fields.username.firstError.errorText}</div>
      )}

      <input
        type="password"
        value={fields.password.value}
        onChange={(e) => fields.password.onChange(e.target.value)}
        onBlur={fields.password.onBlur}
      />
      {fields.password.firstError && (
        <div>{fields.password.firstError.errorText}</div>
      )}

      <button type="submit" disabled={isValidating}>
        Submit
      </button>
    </form>
  );
})
```

## Еще примеры использования

### Пример с динамическими полями

```typescript
const form = formFactory({
  fields: {
    name: { init: '' },
  },
  dynamicFields: {
    emails: {
      init: [''],
      rules: [
        {
          name: 'validEmail',
          errorText: 'Invalid email',
          validator: (email) => email.includes('@'),
        },
      ],
    },
  },
});

// Add new email field
form.dynamicFields.emails.addFieldItem('');

// Remove email field by index
form.dynamicFields.emails.items[0].deleteFieldItem();
```

### Кастомная проверка, изменялось ли поле

```typescript
const form = formFactory({
  fields: {
    description: {
      init: '',
      calculateIsDirty: ({ current, init }) => current.trim() !== init.trim(),
    },
  },
});
```

### Асинхронная валидация

```typescript
const form = formFactory({
  fields: {
    username: {
      init: '',
      rules: [
        {
          name: 'unique',
          errorText: 'Username already taken',
          validator: async (username) => {
            const response = await fetch(`/api/check-username?username=${username}`);
            return response.ok;
          },
        },
      ],
    },
  },
});
```

## API Reference

### `formFactory`

`formFactory` создает [экземпляр формы](#поля-экземпляра-формы), на вход принимает конфигурацию:

```ts
type FormConfigType<
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  fields: FieldConfigsType<Values, DynamicValues>;
  dynamicFields?: DynamicFieldConfigsType<DynamicValues, Values>;
  validateOn?: Array<'submit' | 'blur' | 'change'>;
  afterSubmit?: (
    values: FormValuesType<Values, DynamicValues>,
  ) => void | Promise<void>;
}
```

- `fields` — Конфигурация полей формы ([подробнее](#конфигурация-поля-формы))
- `dynamicFields` — Конфигурация динамических полей формы ([подробнее](#конфигурация-динамического-поля-формы))
    Динамические поля — поля, число которых может изменить пользователь
- `validateOn` — Общие настройки событий, на которые будет вызываться валидация полей формы.  
    Доступные события: `'submit' | 'blur' | 'change'`
- `afterSubmit` — Функция, которая будет вызвана после сабмита формы, при условии, что форма валидна.  
    В `afterSubmit` передаются значения всех полей формы

### Конфигурация поля формы

```ts
type FieldConfigType<
    Value,
    Values extends AnyValuesType,
    DynamicValues extends AnyValuesType
> = {
  init: Value;
  rules?: Array<{
    name: string;
    errorText: string;
    validator: (
        value: Value,
        formValues: FormValuesType<Values, DynamicValues>
    ) => boolean | Promise<boolean>;
  }>;
  validateOn?: Array<'submit' | 'blur' | 'change'>;
  calculateIsDirty?: (params: { current: Value; init: Value }) => boolean;
}
```

- `init` — Начальное значение поля
- `rules` — Правила валидации поля
- `validateOn` — События, на которые будет вызываться валидация поля. Дополняется `validateOn` из конфигурации всей формы: `[...field.validateOn, ...form.validateOn]`
- `calculateIsDirty` — Функция, которая будет вызываться для определения, изменилось ли значение поля. На вход в нее передаются текущее и начальное значения поля. Если функция не была передана, то проверка выполняется `current !== init`

### Конфигурация динамического поля формы

```ts
type DynamicFieldConfigType<
    Value,
    Values extends AnyValuesType,
    DynamicValues extends AnyValuesType
> = {
  init: Value[];
  rules?: Array<{
    name: string;
    errorText: string;
    validator: (
        value: Value,
        formValues: FormValuesType<Values, DynamicValues>
    ) => boolean | Promise<boolean>;
  }>;
  validateOn?: Array<'submit' | 'blur' | 'change'>;
  calculateIsDirty?: (params: { current: Value; init: Value }) => boolean;
}
```

- `init` — Список начальных значений поля
- `rules` — Правила валидации поля
- `validateOn` — События, на которые будет вызываться валидация поля. Дополняется `validateOn` из конфигурации всей формы: `[...field.validateOn, ...form.validateOn]`
- `calculateIsDirty` — Функция, которая будет вызываться для определения, изменилось ли значение поля. На вход в нее передаются текущее и начальное значения поля. Если функция не была передана, то выполняется проверка `current !== init`


### Интерфейс экземпляра формы

```ts
type FormType<Values extends AnyValuesType, DynamicValues extends AnyValuesType> = {
  fields: FieldsType<Values>;
  dynamicFields: DynamicFieldsType<DynamicValues>;
  values: FormValuesType<Values, DynamicValues>;
  submit: () => Generator<void | Promise<any>>;
  reset: () => void;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  isValidating: boolean;
}
```

- `fields` — Поля формы
- `dynamicFields` — Динамические поля формы
- `values` — Текущие значения полей формы
- `submit` — Запускает сабмит формы. Будет проведена валидация всех полей формы, которые подписаны на `submit`. Если валидация успешна, то будет вызван `afterSubmit`
- `reset` — Сбрасывает значения полей формы к начальным
- `isTouched` — `true`, если хотя бы одно поле было потронуто (хоть раз был вызван `onChange`)
- `isDirty` — `true`, если хотя бы одно поле было изменено (`calculateIsDirty` возвращает `true`)
- `isValid` — `true`, если валидация всех полей прошла успешно
- `isValidating` — `true`, если форма валидируется в данный момент

### Интерфейс экземпляра поля формы

```ts
type FieldType<Value> = {
  name: string;
  init: Value;
  value: Value;
  validateEvents: Set<ValidationEventType>;
  onChange: (value: Value) => void;
  onBlur: () => void;
  isTouched: boolean;
  isDirty: boolean;
  errors: FieldErrorType[];
  firstError: FieldErrorType | null;
  resetErrors: () => void;
  reset: () => void;
  validate: () => FieldValidateGeneratorType;
  addError: (error: FieldErrorType) => void;
  isValid: boolean;
  isValidating: boolean;
}
```

- `name` — Имя поля
- `init` — Начальное значение поля
- `value` — Текущее значение поля
- `validateEvents` — События, на которые будет вызываться валидация поля
- `onChange` — Функция для изменения значения поля. Запускает валидацию поля по событию `change`
- `onBlur` — Запускает валидацию поля по событию `blur`
- `isTouched` — `true`, если хотя бы раз был вызван `onChange`
- `isDirty` — `true`, если `calculateIsDirty` возвращает `true`
- `errors` — Список ошибок поля
- `firstError` — Первая ошибка поля (`errors[0]`)
- `resetErrors` — Сброс ошибок поля
- `reset` — Сброс значения поля к начальному
- `validate` — Очищает список ошибок поля и затем запускает валидацию
- `addError` — Добавляет ошибку в список ошибок поля
- `isValid` — `true`, если валидация поля прошла успешно
- `isValidating` — `true`, если поле валидируется в данный момент

### Интерфейс экземпляра динамического поля формы

```ts
type DynamicFieldType<Value> = {
  name: string;
  values: Value[];
  validate: () => DynamicFieldValidateGeneratorType;
  validateEvents: Set<ValidationEventType>;
  items: DynamicFieldItemType<Value>[];
  reset: () => void;
  addFieldItem: (init: Value) => void;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  isValidating: boolean;
}
```

- `name` — Имя поля
- `values` — Текущее значение поля — массив значений элементов
- `validate` — Очищает список ошибок поля и затем запускает валидацию
- `validateEvents` — События, на которые будет вызываться валидация поля
- `items` — массив [элементов](#интерфейс-экземпляра-элемента-динамического-поля-формы) поля
- `reset` — Сброс значений элементов поля к начальным
- `addFieldItem` — Добавление элемента в поле
- `isTouched` — `true`, если хотя бы раз был вызван `onChange`
- `isDirty` — `true`, если `calculateIsDirty` возвращает `true`
- `isValid` — `true`, если валидация элементов поля прошла успешно
- `isValidating` — `true`, если элементы поля валидируются в данный момент

#### Интерфейс экземпляра элемента динамического поля формы

```ts
type DynamicFieldItemType<Value> = {
  id: string;
  init: Value;
  value: Value;
  onChange: (value: Value) => void;
  onBlur: () => void;
  isTouched: boolean;
  isDirty: boolean;
  errors: FieldErrorType[];
  firstError: FieldErrorType | null;
  resetErrors: () => void;
  reset: () => void;
  validate: () => FieldValidateGeneratorType;
  addError: (error: FieldErrorType) => void;
  isValid: boolean;
  isValidating: boolean;
  deleteFieldItem: () => void;
}
```

- `id` — Идентификатор элемента. Генерируется автоматически
- `init` — Начальное значение элемента
- `value` — Текущее значение элемента
- `onChange` — Функция для изменения значения элемента. Запускает валидацию элемента по событию `change`
- `onBlur` — Запускает валидацию элемента по событию `blur`
- `isTouched` — `true`, если хотя бы раз был вызван `onChange`
- `isDirty` — `true`, если `calculateIsDirty` возвращает `true`
- `errors` — Список ошибок
- `firstError` — Первая ошибка элемента (`errors[0]`)
- `resetErrors` — Сброс ошибок элемента
- `reset` — Сброс значения элемента к начальному
- `validate` — Очищает список ошибок элемента и затем запускает валидацию
- `addError` — Добавляет ошибку в список ошибок элемента
- `isValid` — `true`, если валидация элемента прошла успешно
- `isValidating` — `true`, если элемент валидируется в данный момент
- `deleteFieldItem` — Удаляет элемент из поля

# Mobx Forms

Lightweight form management library for mobx applications with TypeScript support

## Installation

```bash
npm install easy-mobx-forms
# or
yarn add easy-mobx-forms
```

## Simple login form example

```typescript
import { observer } from 'mobx-react';
import { formFactory } from 'easy-mobx-forms';

const form = formFactory({
  fields: {
    username: {
      init: '',
      rules: [
        {
          name: 'required',
          errorText: 'Username is required',
          validator: (value) => Boolean(value),
        },
      ],
    },
    password: {
      init: '',
      rules: [
        {
          name: 'required',
          errorText: 'Password is required',
          validator: (value) => Boolean(value),
        },
        {
          name: 'minLength',
          errorText: 'Password must be at least 8 characters',
          validator: (value) => value.length >= 8,
        },
      ],
    },
  },
  validateOn: ['submit'],
});

export const LoginForm = observer(() => {
  const { submit, fields, isValidating } = form;

  return (
    <form onSubmit={submit}>
      <input
        value={fields.username.value}
        onChange={(e) => fields.username.onChange(e.target.value)}
        onBlur={fields.username.onBlur}
      />
      {fields.username.firstError && (
        <div>{fields.username.firstError.errorText}</div>
      )}

      <input
        type="password"
        value={fields.password.value}
        onChange={(e) => fields.password.onChange(e.target.value)}
        onBlur={fields.password.onBlur}
      />
      {fields.password.firstError && (
        <div>{fields.password.firstError.errorText}</div>
      )}

      <button type="submit" disabled={isValidating}>
        Submit
      </button>
    </form>
  );
})
```

## More usage examples

### Dynamic fields example

```typescript
const form = formFactory({
  fields: {
    name: { init: '' },
  },
  dynamicFields: {
    emails: {
      init: [''],
      rules: [
        {
          name: 'validEmail',
          errorText: 'Invalid email',
          validator: (email) => email.includes('@'),
        },
      ],
    },
  },
});

// Add new email field
form.dynamicFields.emails.addFieldItem('');

// Remove email field by index
form.dynamicFields.emails.items[0].deleteFieldItem();
```

### Custom dirty field check

```typescript
const form = formFactory({
  fields: {
    description: {
      init: '',
      calculateIsDirty: ({ current, init }) => current.trim() !== init.trim(),
    },
  },
});
```

### Async validation

```typescript
const form = formFactory({
  fields: {
    username: {
      init: '',
      rules: [
        {
          name: 'unique',
          errorText: 'Username already taken',
          validator: async (username) => {
            const response = await fetch(`/api/check-username?username=${username}`);
            return response.ok;
          },
        },
      ],
    },
  },
});
```

## API Reference

### `formFactory`

`formFactory` creates a [form instance](#form-instance-fields), accepts configuration:

```ts
type FormConfigType<
  Values extends AnyValuesType,
  DynamicValues extends AnyValuesType,
> = {
  fields: FieldConfigsType<Values, DynamicValues>;
  dynamicFields?: DynamicFieldConfigsType<DynamicValues, Values>;
  validateOn?: Array<'submit' | 'blur' | 'change'>;
  afterSubmit?: (
    values: FormValuesType<Values, DynamicValues>,
  ) => void | Promise<void>;
}
```

- `fields` — Form fields configuration ([details](#form-field-configuration))
- `dynamicFields` — Dynamic form fields configuration ([details](#dynamic-form-field-configuration))
    Dynamic fields - fields whose count can be changed by user
- `validateOn` — Global settings for events that trigger form field validation.  
    Available events: `'submit' | 'blur' | 'change'`
- `afterSubmit` — Function called after form submission, if form is valid.  
    `afterSubmit` receives values of all form fields

### Form field configuration

```ts
type FieldConfigType<
    Value,
    Values extends AnyValuesType,
    DynamicValues extends AnyValuesType
> = {
  init: Value;
  rules?: Array<{
    name: string;
    errorText: string;
    validator: (
        value: Value,
        formValues: FormValuesType<Values, DynamicValues>
    ) => boolean | Promise<boolean>;
  }>;
  validateOn?: Array<'submit' | 'blur' | 'change'>;
  calculateIsDirty?: (params: { current: Value; init: Value }) => boolean;
}
```

- `init` — Initial field value
- `rules` — Field validation rules
- `validateOn` — Events that trigger field validation. Combined with form's `validateOn`: `[...field.validateOn, ...form.validateOn]`
- `calculateIsDirty` — Function to determine if field value changed. Receives current and initial values. If not provided, checks `current !== init`

### Dynamic form field configuration

```ts
type DynamicFieldConfigType<
    Value,
    Values extends AnyValuesType,
    DynamicValues extends AnyValuesType
> = {
  init: Value[];
  rules?: Array<{
    name: string;
    errorText: string;
    validator: (
        value: Value,
        formValues: FormValuesType<Values, DynamicValues>
    ) => boolean | Promise<boolean>;
  }>;
  validateOn?: Array<'submit' | 'blur' | 'change'>;
  calculateIsDirty?: (params: { current: Value; init: Value }) => boolean;
}
```

- `init` — List of initial field values
- `rules` — Field validation rules
- `validateOn` — Events that trigger field validation. Combined with form's `validateOn`: `[...field.validateOn, ...form.validateOn]`
- `calculateIsDirty` — Function to determine if field value changed. Receives current and initial values. If not provided, checks `current !== init`


### Form instance interface

```ts
type FormType<Values extends AnyValuesType, DynamicValues extends AnyValuesType> = {
  fields: FieldsType<Values>;
  dynamicFields: DynamicFieldsType<DynamicValues>;
  values: FormValuesType<Values, DynamicValues>;
  submit: () => Generator<void | Promise<any>>;
  reset: () => void;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  isValidating: boolean;
}
```

- `fields` — Form fields
- `dynamicFields` — Dynamic form fields
- `values` — Current form field values
- `submit` — Triggers form submission. Validates all fields subscribed to `submit`. If validation succeeds, calls `afterSubmit`
- `reset` — Resets form fields to initial values
- `isTouched` — `true` if at least one field was touched (had `onChange` called at least once)
- `isDirty` — `true` if at least one field was changed (`calculateIsDirty` returns `true`)
- `isValid` — `true` if all fields passed validation
- `isValidating` — `true` if form is currently validating

### Form field instance interface

```ts
type FieldType<Value> = {
  name: string;
  init: Value;
  value: Value;
  validateEvents: Set<ValidationEventType>;
  onChange: (value: Value) => void;
  onBlur: () => void;
  isTouched: boolean;
  isDirty: boolean;
  errors: FieldErrorType[];
  firstError: FieldErrorType | null;
  resetErrors: () => void;
  reset: () => void;
  validate: () => FieldValidateGeneratorType;
  addError: (error: FieldErrorType) => void;
  isValid: boolean;
  isValidating: boolean;
}
```

- `name` — Field name
- `init` — Initial field value
- `value` — Current field value
- `validateEvents` — Events that trigger field validation
- `onChange` — Function to change field value. Triggers validation on `change` event
- `onBlur` — Triggers validation on `blur` event
- `isTouched` — `true` if `onChange` was called at least once
- `isDirty` — `true` if `calculateIsDirty` returns `true`
- `errors` — List of field errors
- `firstError` — First field error (`errors[0]`)
- `resetErrors` — Clears field errors
- `reset` — Resets field to initial value
- `validate` — Clears error list and then triggers validation
- `addError` — Adds error to field's error list
- `isValid` — `true` if field passed validation
- `isValidating` — `true` if field is currently validating

### Dynamic form field instance interface

```ts
type DynamicFieldType<Value> = {
  name: string;
  values: Value[];
  validate: () => DynamicFieldValidateGeneratorType;
  validateEvents: Set<ValidationEventType>;
  items: DynamicFieldItemType<Value>[];
  reset: () => void;
  addFieldItem: (init: Value) => void;
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
  isValidating: boolean;
}
```

- `name` — Field name
- `values` — Current field values - array of item values
- `validate` — Clears error list and then triggers validation
- `validateEvents` — Events that trigger field validation
- `items` — Array of [field items](#dynamic-form-field-item-instance-interface)
- `reset` — Resets field items to initial values
- `addFieldItem` — Adds new item to field
- `isTouched` — `true` if `onChange` was called at least once
- `isDirty` — `true` if `calculateIsDirty` returns `true`
- `isValid` — `true` if all field items passed validation
- `isValidating` — `true` if field items are currently validating

#### Dynamic form field item instance interface

```ts
type DynamicFieldItemType<Value> = {
  id: string;
  init: Value;
  value: Value;
  onChange: (value: Value) => void;
  onBlur: () => void;
  isTouched: boolean;
  isDirty: boolean;
  errors: FieldErrorType[];
  firstError: FieldErrorType | null;
  resetErrors: () => void;
  reset: () => void;
  validate: () => FieldValidateGeneratorType;
  addError: (error: FieldErrorType) => void;
  isValid: boolean;
  isValidating: boolean;
  deleteFieldItem: () => void;
}
```

- `id` — Item ID. Generated automatically
- `init` — Initial item value
- `value` — Current item value
- `onChange` — Function to change item value. Triggers validation on `change` event
- `onBlur` — Triggers validation on `blur` event
- `isTouched` — `true` if `onChange` was called at least once
- `isDirty` — `true` if `calculateIsDirty` returns `true`
- `errors` — List of errors
- `firstError` — First error (`errors[0]`)
- `resetErrors` — Clears item errors
- `reset` — Resets item to initial value
- `validate` — Clears error list and then triggers validation
- `addError` — Adds error to item's error list
- `isValid` — `true` if item passed validation
- `isValidating` — `true` if item is currently validating
- `deleteFieldItem` — Removes item from field
