import { LabelProps } from './Label.types';
import '../../../styles/globals.css';
import styles from './Label.module.css';

const Label: React.FC<LabelProps> = ({ variant, size, children, ...props }) => {
  const className = [
    styles['ttabook-label'],
    styles[`ttabook-label--${variant}`],
    styles[`ttabook-label--${size}`],
  ];
  return (
    <label className={className.filter(Boolean).join(' ')} {...props}>
      {children}
    </label>
  );
};

export default Label;
