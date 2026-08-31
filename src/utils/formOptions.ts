// Matches the public registration form's field options exactly (and the
// same constants used by the other admin app, copperbelt-marathon-admin),
// so admin-entered values validate/display consistently with everything
// else touching this data.
export const GENDER_OPTIONS = ['male', 'female'];
export const AGE_RANGE_OPTIONS = ['Under 18', '18-29', '30-39', '40-49', '50-59', '60+'];
export const TSHIRT_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
export const ATTENDANCE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'in-person', label: 'In-person' },
  { value: 'virtual', label: 'Virtual' },
];
