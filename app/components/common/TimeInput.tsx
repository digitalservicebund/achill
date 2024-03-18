import moment from "moment";

type WorkingTimeInputProps = {
  name: string;
  time: string;
  onChange: (time: string) => void;
  label: string;
  readOnly?: boolean;
  hasError?: boolean;
};

export function TimeInput({
  name,
  time,
  onChange,
  label,
  readOnly = false,
  hasError = false,
}: WorkingTimeInputProps) {
  function addMinutesToTime(minutes: number) {
    return moment(time, "HH:mm").add(minutes, "minutes").format("HH:mm");
  }

  return (
    <div className="flex items-end">
      <button
        type="button"
        className={`material-symbols-outlined change-time-btn${readOnly ? " invisible" : ""}`}
        onClick={() => {
          onChange(addMinutesToTime(-15));
        }}
        disabled={readOnly}
      >
        Remove
      </button>
      <label htmlFor={name} className="flex flex-col">
        {label}
        <input
          className={`read-only:bg-gray-200 read-only:cursor-not-allowed read-only:border-gray-200 ${hasError ? " error" : ""}`}
          id={name}
          name={name}
          type="time"
          value={time}
          step={900}
          readOnly={readOnly}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      </label>
      <button
        type="button"
        className={`material-symbols-outlined change-time-btn${readOnly ? " invisible" : ""}`}
        onClick={() => {
          onChange(addMinutesToTime(15));
        }}
        disabled={readOnly}
      >
        Add
      </button>
    </div>
  );
}
