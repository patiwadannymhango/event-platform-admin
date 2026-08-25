import Avatar from '@mui/material/Avatar';
import DirectionsRunRoundedIcon from '@mui/icons-material/DirectionsRunRounded';

export default function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <Avatar
      variant="rounded"
      sx={{ width: size, height: size, bgcolor: 'primary.main', borderRadius: 2, flexShrink: 0 }}
    >
      <DirectionsRunRoundedIcon sx={{ fontSize: size * 0.6 }} />
    </Avatar>
  );
}
