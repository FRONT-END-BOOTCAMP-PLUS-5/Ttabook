import Input from '../../atoms/input/Input';
import Label from '../../atoms/label/Label';
import { InputFieldProps } from './InputField.types';
import '../../../styles/globals.css';
import styles from './InputField.module.css';

const InputField: React.FC<InputFieldProps> = ({
  inputProps,
  labelProps,
  direction = 'column',
}) => {
  const { isFullWidth, ref, ...restInputProps } = inputProps;

  const className = [
    styles['ttabook-input-field'],
    styles[`ttabook-input-field--${direction}`],
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <Label {...labelProps} />
      <Input {...restInputProps} isFullWidth={isFullWidth} ref={ref} />
    </div>
  );
};

export default InputField;
