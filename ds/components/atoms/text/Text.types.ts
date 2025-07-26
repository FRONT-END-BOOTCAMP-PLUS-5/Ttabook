import { TextSize } from '../../../styles/tokens/text/size';
import { TextVariant } from '../../../styles/tokens/text/variant';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: TextSize;
  variant?: TextVariant;
  children?: React.ReactNode;
  className?: string;
}
