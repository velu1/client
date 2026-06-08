export const areFieldMappingsValid = (
  fieldsToCheck: any[],
  useFieldIdentifier = false,
  isECIA = false
): boolean => {
  // ✅ Skip validation if ECIA standard is used
  if (isECIA) return true;

  const nonEmptyFields = [...fieldsToCheck].filter(
    (f) =>
      f.fieldName.trim() !== "" ||
      f.fieldValue.trim() !== "" ||
      f.fieldIdentifier.trim() !== ""
  );

  if (nonEmptyFields.length < 2) return false;

  const valueKey = isECIA
    ? "fieldValue"
    : useFieldIdentifier
    ? "fieldIdentifier"
    : "fieldValue";

  const firstTwoValid =
    nonEmptyFields[0].fieldName.trim() !== "" &&
    nonEmptyFields[0][valueKey].trim() !== "" &&
    nonEmptyFields[1].fieldName.trim() !== "" &&
    nonEmptyFields[1][valueKey].trim() !== "";

  const additionalFields = nonEmptyFields.slice(2);
  const hasAtLeastOneFilled = additionalFields.some(
    (f) => f.fieldName.trim() !== "" || f[valueKey].trim() !== ""
  );

  const allAdditionalFilled = additionalFields.every((field) => {
    if (field.fieldName.trim() === "" && field[valueKey].trim() === "") {
      return true;
    }
    return field.fieldName.trim() !== "" && field[valueKey].trim() !== "";
  });

  return firstTwoValid && (!hasAtLeastOneFilled || allAdditionalFilled);
};
