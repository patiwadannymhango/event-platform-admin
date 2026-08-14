import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHorizOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccountsOutlined';
import CorporateFareIcon from '@mui/icons-material/CorporateFareOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined';
import { useAuth } from '../context/AuthContext';
import { EVENT_ID } from '../api/client';

const DRAWER_WIDTH = 250;

export default function Layout() {
  const { logout, isSuperuser, organizations, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentsOpen, setPaymentsOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isPaymentsSection = location.pathname.startsWith('/payments');

  // Single-event scope for now — the active event's (VITE_EVENT_ID) name,
  // if resolvable from the caller's memberships, otherwise a generic
  // fallback (a superuser with no membership row still needs something
  // to show, and so does anyone before /me/ has resolved).
  const eventName =
    organizations.flatMap((org) => org.events).find((e) => e.id === EVENT_ID)?.name ||
    'Event Admin';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar sx={{ px: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap>
            {eventName}
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, pt: 1 }}>
          <ListItemButton
            component={NavLink}
            to="/"
            end
            sx={{ borderRadius: 1.5, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}><DashboardIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Dashboard" slotProps={{ primary: { fontSize: 14 } }} />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/registrations"
            sx={{ borderRadius: 1.5, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}><PeopleIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Registrations" slotProps={{ primary: { fontSize: 14 } }} />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/participants"
            sx={{ borderRadius: 1.5, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}><BadgeIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Participants" slotProps={{ primary: { fontSize: 14 } }} />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/notifications"
            sx={{ borderRadius: 1.5, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}><NotificationsIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Notifications" slotProps={{ primary: { fontSize: 14 } }} />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/events"
            sx={{ borderRadius: 1.5, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}><EventIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Events" slotProps={{ primary: { fontSize: 14 } }} />
          </ListItemButton>

          <ListItemButton
            onClick={() => setPaymentsOpen((o) => !o)}
            selected={isPaymentsSection}
            sx={{ borderRadius: 1.5, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}><PaymentsIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Payments & Wallet" slotProps={{ primary: { fontSize: 14 } }} />
            {paymentsOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </ListItemButton>

          <Collapse in={paymentsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={NavLink}
                to="/payments/overview"
                sx={{ borderRadius: 1.5, pl: 4.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}><AccountBalanceWalletIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Wallet" slotProps={{ primary: { fontSize: 13.5 } }} />
              </ListItemButton>
              <ListItemButton
                component={NavLink}
                to="/payments/transactions"
                sx={{ borderRadius: 1.5, pl: 4.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}><SwapHorizIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Transactions" slotProps={{ primary: { fontSize: 13.5 } }} />
              </ListItemButton>
              <ListItemButton
                component={NavLink}
                to="/payments/records"
                sx={{ borderRadius: 1.5, pl: 4.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Payments" slotProps={{ primary: { fontSize: 13.5 } }} />
              </ListItemButton>
            </List>
          </Collapse>

          {isSuperuser && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ px: 2, fontSize: 11 }}
              >
                Platform
              </Typography>

              <ListItemButton
                component={NavLink}
                to="/users"
                sx={{ borderRadius: 1.5, mb: 0.5, mt: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><ManageAccountsIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Users" slotProps={{ primary: { fontSize: 14 } }} />
              </ListItemButton>

              <ListItemButton
                component={NavLink}
                to="/organizations"
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><CorporateFareIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Organizations" slotProps={{ primary: { fontSize: 14 } }} />
              </ListItemButton>

              <ListItemButton
                component={NavLink}
                to="/payment-providers"
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}><AccountBalanceIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary="Payment providers" slotProps={{ primary: { fontSize: 14 } }} />
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" elevation={0} color="transparent">
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {(user?.first_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate('/profile');
                }}
              >
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: 4, maxWidth: 1280 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
