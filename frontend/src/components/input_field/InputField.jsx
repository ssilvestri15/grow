import { React, useEffect } from "react";
import "./input_field.css";

function InputField({ typeInput = "text", placeholder = "", state, onFieldChange }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);


  /*useEffect(() => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  }, [state]);*/

  const handleChange = (e) => {
    onFieldChange(e.target.value);
  }

  return (
    <div className={(state.error !== "") ? "input_field invalid": "input_field"}>
      {typeInput !== "textarea" ? (
        <input
          type={typeInput}
          value={state.value}
          onChange={(e) => {onFieldChange(e.target.value)}}
          className={(typeInput === "datetime-local" ? "input date" : "input")}
          placeholder={placeholder}
          {...(typeInput === "number" ? { min: 0.4 } : {})}
          {...(typeInput === "number" ? { step: 0.1 } : {})}
          {...(typeInput === "datetime-local" ? { min: tomorrow.toISOString().split("T")[0] } : {})}
        />
      ) : (
        <div className="textarea_container">
          <textarea
            value={state.value}
            onChange={handleChange}
            className="input"
            placeholder={placeholder}
            maxLength={250}
          />
          <div className="textarea_char">{state.value.length}/250</div>
        </div>
      )}
    </div>
  );
}

export { InputField };
