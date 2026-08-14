import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import Divider, { dividerClasses } from '@mui/material/Divider';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import MenuButton from './MenuButton';
import { useAuth } from '../context/AuthContext';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

export default function OptionsMenu() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <React.Fragment>
      <MenuButton
        aria-label="Open menu"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ borderColor: 'transparent' }}
      >
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: { padding: '4px' },
          [`& .${paperClasses.root}`]: { padding: 0 },
          [`& .${dividerClasses.root}`]: { margin: '4px -4px' },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            navigate('/profile');
          }}
        >
          <ListItemText>Profile</ListItemText>
          <ListItemIcon sx={{ [`&.${listItemIconClasses.root}`]: { ml: 'auto', minWidth: 0 } }}>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            logout();
            navigate('/login');
          }}
        >
          <ListItemText>Logout</ListItemText>
          <ListItemIcon sx={{ [`&.${listItemIconClasses.root}`]: { ml: 'auto', minWidth: 0 } }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
