import * as yup from "yup";

export const entryFormValidationScheme = yup.object().shape({
  hours: yup
    .string()
    .required()
    .matches(/^(\d?\d|\d?\d[:,.]\d\d?)$/, {
      message: "hours format must be either 5:30 or 5.5 or 5,5",
    }),
  description: yup.string().required().matches(/\w+/, {
    message: "provide a description",
  }),
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
