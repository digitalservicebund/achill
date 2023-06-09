import * as yup from "yup";

const entryFormValidationScheme = yup.object().shape({
    hours: yup
        .string()
        .required("Hours are required, must be hh:mm")
        .matches(/^(\d?\d|\d?\d:\d\d?)$/),
    description: yup.string().required("Description is required"),
});

export async function validateForm(values) {
    let errors = {}
    try {
        // `abortEarly: false` to get all the errors
        await entryFormValidationScheme.validate(values, {
            abortEarly: false,
        });
        errors = {};
    } catch (err) {
        errors = err.inner.reduce((acc, err) => {
            return { ...acc, [err.path]: err.message };
        }, {});
    }

    return errors;
};