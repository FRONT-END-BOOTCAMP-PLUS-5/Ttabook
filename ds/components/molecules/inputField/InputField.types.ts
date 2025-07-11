import { InputProps } from '../../atoms/input/Input.types';
import { LabelProps } from '../../atoms/label/Label.types';

export interface InputFieldProps {
  inputProps: InputProps;
  labelProps?: LabelProps;
  direction?: 'row' | 'column';
}
