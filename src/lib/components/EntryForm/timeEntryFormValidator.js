import * as yup from "yup";

const entryFormValidationScheme = yup.object().shape({
  hours: yup
    .string()
    .required("Format must be either 5:30 or 5.5 or 5,5")
    // .matches(/^(\d?\d|\d?\d:\d\d?)$/),
    .matches(/^(\d?\d|\d?\d[:,.]\d\d?)$/),
  description: yup.string().required("Description is required"),
});

export async function validateForm(values) {
  let errors = {};
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
}
