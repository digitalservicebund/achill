import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import type { Time } from "./dateTimeUtils";
import { YYYY_MM_DD_FORMAT, timeSchema, timeToMinutes } from "./dateTimeUtils";

export type WorkTimeFormData = {
  startTime: Time;
  breakTime: number;
  endTime: Time;
  date: string;
  _action: "POST" | "PATCH" | "DELETE";
};

export const workTimeFormDataSchema = z
  .object({
    startTime: timeSchema,
    breakTime: timeSchema.transform((time) => timeToMinutes(time)),
    endTime: timeSchema,
    date: z.string().regex(YYYY_MM_DD_FORMAT),
    _action: z.enum(["POST", "PATCH", "DELETE"]),
  })
  .refine(
    (schema) =>
      schema.breakTime >=
      timeToMinutes(schema.startTime) - timeToMinutes(schema.endTime),
    { message: "Invalid work time.", path: ["allTimes"] },
  ) satisfies ZodSchema<WorkTimeFormData, ZodTypeDef, unknown>;
