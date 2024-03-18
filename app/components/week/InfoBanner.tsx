import {
  getDescriptionForEventType,
  getItemForEventType,
} from "~/utils/calendarEventUtils";
import { TransformedCalendarEvent } from "~/utils/transformCalendarEvents";

interface Props {
  event: TransformedCalendarEvent;
}

export function InfoBanner({ event }: Props) {
  const symbol = getItemForEventType(event.type);

  let text = "";

  if (event.duration == "HalfDay") {
    text = "½ Day: ";
  }

  text += getDescriptionForEventType(event.type);

  return (
    <div
      data-testid={event.type}
      className="flex w-full items-center justify-start rounded-lg bg-blue-600 p-4"
    >
      <span className="material-symbols-outlined mr-2 text-white">
        {symbol}
      </span>
      <p className="text-sm text-white">{text}</p>
    </div>
  );
}
