import "./App.css";
import { observer } from "mobx-react";
import { formFactory } from "./libV2";
import { FormEventHandler } from "react";

const formWithDynamicField = formFactory({
  fields: {
    firstName: {
      init: "",
      rules: [
        {
          name: "required",
          errorText: "required",
          validator: async (value) => {
            return await new Promise((resolve) =>
              setTimeout(() => resolve(Boolean(value)), 2000),
            );
          },
        },
      ],
    },
    number: {
      init: 0,
    },
    numbers: {
      init: ["1", "3"],
      isDynamic: true,
      rules: [
        {
          name: "required",
          errorText: "required",
          validator: (value) => Boolean(value),
        },
      ],
    },
  },
  validateOn: ["submit", "change"],
});

export const App = observer(() => {
  const { fields, reset, isValid, isTouched, isDirty, submit } =
    formWithDynamicField;

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="input"
        value={fields.firstName.value}
        onChange={(e) => fields.firstName.onChange(e.target.value)}
      />
      <div className="errors">
        <p>{`isValidating: ${fields.firstName.isValidating}`}</p>
        {fields.firstName.errors.map((error) => (
          <p key={error.name} className="error">
            {error.errorText}
          </p>
        ))}
      </div>
      <input
        className="input"
        value={fields.number.value}
        type="number"
        onChange={(e) => fields.number.onChange(Number(e.target.value))}
      />
      {fields.numbers.items.map((item) => (
        <div key={item.id}>
          <div>
            <input
              className="input"
              value={item.value}
              type="number"
              onChange={(e) => {
                item.onChange(e.target.value);
              }}
            />
            <button
              type="button"
              onClick={() => fields.numbers.deleteFieldItem(item.id)}
            >
              delete field
            </button>
          </div>
          <div className="errors">
            <p>{`isValidating: ${item.isValidating}`}</p>
            {item.errors.map((error) => (
              <p key={error.name} className="error">
                {error.errorText}
              </p>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          fields.numbers.addFieldItem("4");
        }}
      >
        add field
      </button>
      <p className="field">{`isValid: ${isValid}`}</p>
      <p className="field">{`isDirty: ${isDirty}`}</p>
      <p className="field">{`isTouched: ${isTouched}`}</p>
      <button type="button" onClick={reset}>
        reset form
      </button>
      <button type="submit">submit</button>
    </form>
  );
});
