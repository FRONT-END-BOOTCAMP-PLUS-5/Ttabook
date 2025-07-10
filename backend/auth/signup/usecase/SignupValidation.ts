import { z } from 'zod';
import { emailField } from '../../../application/dto/EmailField';
import { passwordField } from '../../../application/dto/PasswordField';
import { nameField } from '../../../application/dto/NameField';
import { userTypeField } from '../../../application/dto/UserTypeField';

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