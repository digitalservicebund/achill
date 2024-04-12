import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import type { Time } from "./dateTimeUtils";
import { YYYY_MM_DD_FORMAT, timeSchema, timeToMinutes } from "./dateTimeUtils";

export type WorkTimeFormData = {
  startTime: Time;
  breakTime: number;
  endTime: Time;
  date: string;
};

function calculateWorkTime(schema: WorkTimeFormData) {
  return (
    timeToMinutes(schema.endTime) -
    timeToMinutes(schema.startTime) -
    schema.breakTime
  );
}

export const workTimeFormDataSchema = z
  .object({
    startTime: timeSchema,
    breakTime: z
      .string()
      .transform((time) => Number(time))
      .refine((time) => time >= 0, {
        message: "Break time can't be negative.",
        path: ["breakTime"],
      }),
    endTime: timeSchema,
    date: z.string().regex(YYYY_MM_DD_FORMAT),
  })
  .refine((schema) => calculateWorkTime(schema) > 0, {
    message: "Invalid work time.",
    path: ["allTimes"],
  })
  .refine(
    (schema) =>
      !(
        calculateWorkTime(schema) > 360 &&
        calculateWorkTime(schema) <= 540 &&
        schema.breakTime < 30
      ),
    { message: "Break must be at least 30 minutes.", path: ["breakTime"] },
  )
  .refine(
    (schema) =>
      !(
        calculateWorkTime(schema) > 540 &&
        calculateWorkTime(schema) <= 600 &&
        schema.breakTime < 45
      ),
    { message: "Break must be at least 45 minutes.", path: ["breakTime"] },
  )
  .refine((schema) => calculateWorkTime(schema) <= 600, {
    message: "Work time must be less than 10 hours.",
    path: ["allTimes"],
  }) satisfies ZodSchema<WorkTimeFormData, ZodTypeDef, unknown>;
