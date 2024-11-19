import { React, useEffect, useRef } from "react";
import "./input_field.css";

function InputField({ typeInput = "text", placeholder = "", state, onFieldChange }) {
  const textareaRef = useRef(null);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);


  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to auto
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height to scrollHeight
    }
  }, [state.value]);

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
            ref={textareaRef}
            value={state.value}
            onChange={handleChange}
            className="input"
            placeholder={placeholder}
            maxLength={1000}
          />
          <div className="textarea_char">{state.value.length}/1000</div>
        </div>
      )}
    </div>
  );
}

export { InputField };
