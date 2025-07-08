import { z } from 'zod';
import { emailField } from '../../../application/dto/EmailField';
import { passwordField } from '../../../application/dto/PasswordField';

export const LoginRequestSchema = z.object({
  email: emailField,
  password: passwordField,
});

export type LoginRequestInput = z.input<typeof LoginRequestSchema>;
export type LoginRequestOutput = z.output<typeof LoginRequestSchema>;

export const validateLoginRequest = (data: unknown) => {
  return LoginRequestSchema.parse(data);
};

export const safeValidateLoginRequest = (data: unknown) => {
  return LoginRequestSchema.safeParse(data);
};