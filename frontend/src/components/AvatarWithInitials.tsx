import { Avatar } from 'antd';

interface AvatarWithInitialsProps {
  firstName: string;
  lastName: string;
  size?: number | 'small' | 'default' | 'large';
  style?: React.CSSProperties;
}

// Generate consistent color based on name
const getColorFromName = (name: string): string => {
  const colors = [
    '#f56a00', // Orange
    '#7265e6', // Purple
    '#ffbf00', // Yellow
    '#00a2ae', // Teal
    '#f50', // Red-Orange
    '#2db7f5', // Blue
    '#87d068', // Green
    '#108ee9', // Blue
    '#ff6b9d', // Pink
    '#c41d7f', // Magenta
    '#13c2c2', // Cyan
    '#52c41a', // Light Green
    '#fa8c16', // Orange
    '#eb2f96', // Pink
    '#722ed1', // Purple
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const AvatarWithInitials = ({
  firstName,
  lastName,
  size = 'default',
  style,
}: AvatarWithInitialsProps) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const backgroundColor = getColorFromName(`${firstName}${lastName}`);

  return (
    <Avatar
      size={size}
      style={{
        backgroundColor,
        ...style,
      }}
    >
      {initials}
    </Avatar>
  );
};
