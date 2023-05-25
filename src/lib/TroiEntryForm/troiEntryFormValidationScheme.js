import * as yup from "yup";

export const troiEntryFormValidationScheme = yup.object().shape({
    hours: yup
        .string()
        .required("Hours are required, must be hh:mm")
        .matches(/^(\d?\d|\d?\d:\d\d?)$/),
    description: yup.string().required("Description is required"),
});