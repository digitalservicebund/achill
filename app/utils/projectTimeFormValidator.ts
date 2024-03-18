import type { ZodSchema, ZodTypeDef } from "zod";
import { z } from "zod";
import { YYYY_MM_DD_FORMAT, convertTimeStringToFloat } from "./dateTimeUtils";

export type ProjectTimeSaveFormData = {
  calculationPositionId: number;
  date: string;
  hours: number;
  description: string;
  isBillable: boolean;
  isInvoiced: false;
};

// matches the following formats: 8, 8:30, 8.5, 8,5
const timeInputFormat = /^((1?\d|2[0-3])(:[0-5]\d)?|((1?\d|2[0-3])[.,]\d+))$/;

export const projectTimeSaveFormSchema = z.object({
  calculationPositionId: z.string().transform((id) => parseInt(id)),
  date: z.string().regex(YYYY_MM_DD_FORMAT),
  hours: z
    .string()
    .regex(timeInputFormat, "Time is missing or in the wrong format.")
    .transform(convertTimeStringToFloat)
    .refine((hours) => hours <= 10, {
      message: "You can't book more than 10 hours.",
    }),
  description: z.string().min(1, "Description is required."),
  isBillable: z.string().transform((value) => value === "true"),
  isInvoiced: z
    .string()
    .refine((value) => value === "false", {
      message: "Invoiced project times cannot be modified.",
    })
    .transform(() => false) as ZodSchema<false, ZodTypeDef, unknown>,
}) satisfies ZodSchema<ProjectTimeSaveFormData, ZodTypeDef, unknown>;
