import { z } from 'zod';
import { emailField } from '../../dtos/EmailField';
import { passwordField } from '../../dtos/PasswordField';
import { nameField } from '../../dtos/NameField';
import { userTypeField } from '../../dtos/UserTypeField';

export const SignupRequestSchema = z.object({
  email: emailField,
  password: passwordField,
  name: nameField,
  type: userTypeField,
});

export type SignupRequestInput = z.input<typeof SignupRequestSchema>;
export type SignupRequestOutput = z.output<typeof SignupRequestSchema>;

export const validateSignupRequest = (data: unknown) => {
  return SignupRequestSchema.parse(data);
};

export const safeValidateSignupRequest = (data: unknown) => {
  return SignupRequestSchema.safeParse(data);
};