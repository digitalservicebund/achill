import { addDaysToDate, getWeekNumberFor } from "~/utils/dateTimeUtils";

interface Props {
  selectedDate: Date;
  onSelectDate: (newDate: Date) => unknown;
}

export function WeekSelect({ selectedDate, onSelectDate }: Props) {
  function changeWeek(direction: -1 | 1) {
    onSelectDate(addDaysToDate(selectedDate, 7 * direction));
  }

  return (
    <div className="mb-3 flex items-center">
      <button
        data-testid="btn-previous-week"
        aria-label="calendar backward"
        className="-ml-1.5 flex items-center justify-center text-gray-600 hover:text-gray-400"
        onClick={() => changeWeek(-1)}
      >
        <span className="material-symbols-outlined"> chevron_left </span>
      </button>
      <div
        tabIndex={0}
        className="min-w-[9ch] px-2 text-center text-sm text-gray-600 focus:outline-none"
      >
        Week {getWeekNumberFor(selectedDate)}
      </div>
      <button
        data-testid="btn-next-week"
        aria-label="calendar forward"
        className="flex items-center justify-center text-gray-600 hover:text-gray-400"
        onClick={() => changeWeek(1)}
      >
        <span className="material-symbols-outlined"> chevron_right </span>
      </button>
      <button
        data-testid="btn-today"
        aria-label="today"
        className="min-w-[7ch] text-center font-bold text-blue-600 hover:text-blue-700"
        onClick={() => {
          onSelectDate(new Date());
        }}
      >
        Today
      </button>
    </div>
  );
}
