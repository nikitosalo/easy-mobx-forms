import "./App.css";
import { observer } from "mobx-react";
import { formFactory } from "../lib";
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
    array: {
      init: {
        a: 1,
        b: "",
        c: ["", 1],
      },
    },
  },
  dynamicFields: {
    numbers: {
      init: ["1", "3"],
      rules: [
        {
          name: "required",
          errorText: "required",
          validator: (value) => Boolean(value),
        },
      ],
    },
    objects: {
      init: [
        {
          a: 1,
          b: "",
        },
      ],
      rules: [
        {
          name: "required_a",
          errorText: "required",
          validator: (value) => {
            return Boolean(value.a);
          },
        },
      ],
    },
  },
  validateOn: ["submit", "change"],
  afterSubmit: async (values) => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    console.log("afterSubmit", values);
  },
});

export const App = observer(() => {
  const { fields, dynamicFields, reset, isValid, isTouched, isDirty, submit } =
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
      {dynamicFields.numbers.items.map((item) => (
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
            <button type="button" onClick={item.deleteFieldItem}>
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
          dynamicFields.numbers.addFieldItem("4");
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
