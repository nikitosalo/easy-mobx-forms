import "./App.css";
import { observer } from "mobx-react";
import { formFactory } from "../lib";

const formWithDynamicField = formFactory({
  fields: {
    firstName: {
      init: "",
      rules: [
        {
          name: "required",
          errorText: "required",
          validator: (value, values) => {
            console.log(values);
            return Boolean(
              value && values.dynamicFieldsValues.numbers.length > 3,
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
          validator: (value) => {
            return Boolean(value);
          },
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
});

export const App = observer(() => {
  const { fields, dynamicFields, reset, isValid, isTouched, isDirty, submit } =
    formWithDynamicField;

  const handleSubmit = (e) => {
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
      <button type="submit">send</button>
    </form>
  );
});
