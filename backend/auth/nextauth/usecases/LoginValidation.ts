import { z } from 'zod';
import { emailField } from '../../dtos/EmailField';
import { passwordField } from '../../dtos/PasswordField';

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