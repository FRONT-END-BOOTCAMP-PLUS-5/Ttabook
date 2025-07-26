import { iconList } from '../../../styles/tokens/icon/icons';
import { IconProps } from './Icon.types';
import { color } from '../../../styles/tokens/color';
const { primary } = color;

const Icon: React.FC<IconProps> = ({ name, size = 24, color = primary }) => {
  return (
    <svg
      width={size}
      height={size}
      stroke={color}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1}
      xmlns="http://www.w3.org/2000/svg"
    >
      {iconList[name]}
    </svg>
  );
};

export default Icon;
