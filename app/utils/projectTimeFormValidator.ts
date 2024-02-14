import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import type { Time } from "./dateTimeUtils";
import { YYYY_MM_DD_FORMAT, timeSchema } from "./dateTimeUtils";

export type ProjectTimeSaveFormData = {
  calculationPositionId: string;
  date: string;
  hours: Time;
  description: string;
};

export const projectTimeSaveFormSchema = z.object({
  calculationPositionId: z.string(),
  date: z.string().regex(YYYY_MM_DD_FORMAT),
  hours: timeSchema,
  description: z.string().min(1, "Description is required."),
}) satisfies ZodSchema<ProjectTimeSaveFormData, ZodTypeDef, unknown>;