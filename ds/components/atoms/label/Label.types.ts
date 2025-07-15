import { TextVariant } from '@/ds/styles/tokens/text/variant';
import { TextSize } from '@/ds/styles/tokens/text/size';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: TextVariant;
  size?: TextSize;
  children?: React.ReactNode;
}
