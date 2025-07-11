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
  const className = [
    styles['ttabook-input-field'],
    styles[`ttabook-input-field--${direction}`],
  ];

  return (
    <div className={className.join(' ')}>
      <Label {...labelProps} />
      <Input {...inputProps} />
    </div>
  );
};

export default InputField;
