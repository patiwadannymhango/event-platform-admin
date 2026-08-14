import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  drawerClasses,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import PaymentsIcon from '@mui/icons-material/PaymentsRounded';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import BadgeIcon from '@mui/icons-material/BadgeRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import EventIcon from '@mui/icons-material/EventRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccountsRounded';
import CorporateFareIcon from '@mui/icons-material/CorporateFareRounded';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useAuth } from '../context/AuthContext';
import { EVENT_ID } from '../api/client';
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';
import OptionsMenu from './OptionsMenu';

const DRAWER_WIDTH = 240;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/registrations': 'Registrations',
  '/participants': 'Participants',
  '/notifications': 'Notifications',
  '/events': 'Events',
  '/payments/overview': 'Wallet',
  '/payments/transactions': 'Transactions',
  '/payments/records': 'Payments',
  '/users': 'Users',
  '/organizations': 'Organizations',
  '/payment-providers': 'Payment providers',
  '/profile': 'Profile',
};

export default function Layout() {
  const { isSuperuser, organizations, user } = useAuth();
  const location = useLocation();
  const [paymentsOpen, setPaymentsOpen] = useState(true);

  const isPaymentsSection = location.pathname.startsWith('/payments');
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  // Single-event scope for now — the active event's (VITE_EVENT_ID) name,
  // if resolvable from the caller's memberships, otherwise a generic
  // fallback (a superuser with no membership row still needs something
  // to show, and so does anyone before /me/ has resolved).
  const eventName =
    organizations.flatMap((org) => org.events).find((e) => e.id === EVENT_ID)?.name ||
    'Event Admin';

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          boxSizing: 'border-box',
          [`& .${drawerClasses.paper}`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box sx={{ display: 'flex', p: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ px: 1 }}>
            {eventName}
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
            <List dense>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton component={NavLink} to="/" end selected={location.pathname === '/'}>
                  <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to="/registrations"
                  selected={location.pathname === '/registrations'}
                >
                  <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Registrations" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to="/participants"
                  selected={location.pathname === '/participants'}
                >
                  <ListItemIcon><BadgeIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Participants" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to="/notifications"
                  selected={location.pathname === '/notifications'}
                >
                  <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to="/events"
                  selected={location.pathname === '/events'}
                >
                  <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Events" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton onClick={() => setPaymentsOpen((o) => !o)} selected={isPaymentsSection}>
                  <ListItemIcon><PaymentsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Payments & Wallet" />
                  {paymentsOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </ListItemButton>
              </ListItem>

              <Collapse in={paymentsOpen} timeout="auto" unmountOnExit>
                <List dense component="div" disablePadding>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={NavLink}
                      to="/payments/overview"
                      selected={location.pathname === '/payments/overview'}
                      sx={{ pl: 3 }}
                    >
                      <ListItemIcon><AccountBalanceWalletIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Wallet" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={NavLink}
                      to="/payments/transactions"
                      selected={location.pathname === '/payments/transactions'}
                      sx={{ pl: 3 }}
                    >
                      <ListItemIcon><SwapHorizIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Transactions" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      component={NavLink}
                      to="/payments/records"
                      selected={location.pathname === '/payments/records'}
                      sx={{ pl: 3 }}
                    >
                      <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Payments" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>
            </List>

            {isSuperuser && (
              <List
                dense
                subheader={
                  <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 500 }}>
                    PLATFORM
                  </Typography>
                }
              >
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton component={NavLink} to="/users" selected={location.pathname === '/users'}>
                    <ListItemIcon><ManageAccountsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Users" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to="/organizations"
                    selected={location.pathname === '/organizations'}
                  >
                    <ListItemIcon><CorporateFareIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Organizations" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink}
                    to="/payment-providers"
                    selected={location.pathname === '/payment-providers'}
                  >
                    <ListItemIcon><AccountBalanceIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Payment providers" />
                  </ListItemButton>
                </ListItem>
              </List>
            )}
          </Stack>
        </Box>

        <Stack
          direction="row"
          sx={{ p: 2, gap: 1, alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
            {(user?.first_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
          </Avatar>
          <Box sx={{ mr: 'auto', overflow: 'hidden' }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 500, lineHeight: '16px' }}>
              {user?.full_name || 'Admin'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>
          <OptionsMenu />
        </Stack>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh', overflow: 'auto' }}
      >
        <Stack spacing={2} sx={{ mx: 3, pb: 5, pt: 2 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 1.5 }}
          >
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary">Event Admin</Typography>
              <NavigateNextRoundedIcon fontSize="small" sx={{ color: 'action.disabled' }} />
              <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {pageTitle}
              </Typography>
            </Stack>
            <ColorModeIconDropdown />
          </Stack>
          <Outlet />
        </Stack>
      </Box>
    </Box>
  );
}
