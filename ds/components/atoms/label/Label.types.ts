import { TextVariant } from '../../../styles/tokens/text/variant';
import { TextSize } from '../../../styles/tokens/text/size';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: TextVariant;
  size?: TextSize;
  children?: React.ReactNode;
}
