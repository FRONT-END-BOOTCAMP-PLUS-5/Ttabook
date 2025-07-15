import Text from './Text';
import { TextProps } from './Text.types';

const TitleText: React.FC<TextProps> = ({
  children,
  size = 'xl',
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <Text size={size} variant={variant} className={className} {...props}>
      {children}
    </Text>
  );
};

const SubTitleText: React.FC<TextProps> = ({
  children,
  size = 'lg',
  variant = 'secondary',
  className,
  ...props
}) => {
  return (
    <Text size={size} variant={variant} className={className} {...props}>
      {children}
    </Text>
  );
};

const DescText: React.FC<TextProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <Text size={size} variant={variant} className={className} {...props}>
      {children}
    </Text>
  );
};

const CaptionText: React.FC<TextProps> = ({
  children,
  size = 'sm',
  variant = 'primary',
  className,
  ...props
}) => {
  return (
    <Text size={size} variant={variant} className={className} {...props}>
      {children}
    </Text>
  );
};

export { TitleText, SubTitleText, DescText, CaptionText };
