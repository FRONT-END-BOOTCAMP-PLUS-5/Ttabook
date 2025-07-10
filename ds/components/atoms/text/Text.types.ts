import { TextSize } from "@/ds/styles/tokens/text/size";
import { TextVariant } from "@/ds/styles/tokens/text/variant";

export interface TextProps extends React.HTMLAttributes<HTMLDivElement> { 
  size?: TextSize;
  variant?: TextVariant;
  children?: React.ReactNode;
}