import Text from "./Text"
import { TextProps } from "./Text.types"

const TitleText:React.FC<TextProps> = ({
  children,
  size = 'xl',
  variant = 'primary',
  ...props
}) => {
  return(
    <Text
      size={size}
      variant={variant}
      {...props}
    >
      {children}
    </Text>
  )
}

const SubTitleText:React.FC<TextProps> = ({
  children,
  size = 'lg',
  variant = 'secondary',
  ...props
}) => {
  return (
    <Text
      size={size}
      variant={variant}
      {...props}
    >
      {children}
    </Text>
  )
}

const DescText:React.FC<TextProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  ...props
}) => {
  return (
    <Text
      size={size}
      variant={variant}
      {...props}
    >
      {children}
    </Text>
  )
}

const CaptionText:React.FC<TextProps> = ({
  children,
  size = 'sm',
  variant = 'primary',
  ...props
}) => {
  return (
    <Text
      size={size}
      variant={variant}
      {...props}
    >
      {children}
    </Text>
  )
}

export { TitleText, SubTitleText, DescText, CaptionText }