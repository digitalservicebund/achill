import React from "react";

type TimeInputProps = {
  name: string;
  label: string;
  time: string | number;
  readOnly?: boolean;
  hasError?: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TimeInput({
  name,
  label,
  time,
  readOnly = false,
  hasError = false,
  onAdd,
  onRemove,
  onChange,
}: Readonly<TimeInputProps>) {
  const isMinutes = typeof time === "number";
  return (
    <div className="flex items-end">
      <button
        type="button"
        className={`material-symbols-outlined change-time-btn${readOnly ? " invisible" : ""}`}
        onClick={onRemove}
        disabled={readOnly}
      >
        Remove
      </button>
      <label htmlFor={name} className="flex flex-col">
        {label}
        <input
          className={`read-only:bg-gray-200 read-only:cursor-not-allowed read-only:border-gray-200 ${isMinutes ? " w-20" : ""}${hasError ? " error" : ""}`}
          id={name}
          name={name}
          type={isMinutes ? "number" : "time"}
          value={time}
          step={isMinutes ? 5 : 900}
          disabled={readOnly}
          onChange={onChange}
        />
      </label>
      <button
        type="button"
        className={`material-symbols-outlined change-time-btn${readOnly ? " invisible" : ""}`}
        onClick={onAdd}
        disabled={readOnly}
      >
        Add
      </button>
    </div>
  );
}
