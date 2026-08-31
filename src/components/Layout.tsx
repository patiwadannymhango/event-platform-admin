import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Box,
  Breadcrumbs,
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
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import PaymentsIcon from '@mui/icons-material/PaymentsRounded';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import ManageAccountsIcon from '@mui/icons-material/ManageAccountsRounded';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceRounded';
import { useAuth } from '../context/AuthContext';
import BrandMark from './BrandMark';
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';
import OptionsMenu from './OptionsMenu';

const DRAWER_WIDTH = 260;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/registrations': 'Registrations',
  '/notifications': 'Notifications',
  '/payments/overview': 'Wallet',
  '/payments/transactions': 'Transactions',
  '/payments/records': 'Payments',
  '/users': 'Admin users',
  '/payment-providers': 'Payment providers',
  '/profile': 'Profile',
};

export default function Layout() {
  const { isSuperuser } = useAuth();
  const location = useLocation();
  const isPaymentsSection = location.pathname.startsWith('/payments');
  // Closed by default — but starts open if you're deep-linked straight
  // into a Payments/Wallet sub-page, so the active item isn't hidden.
  const [paymentsOpen, setPaymentsOpen] = useState(isPaymentsSection);
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

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
          },
        }}
      >
        <Stack sx={{ height: '100%' }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 2.5, py: 2.25 }}>
            <BrandMark />
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                Copperbelt Marathon 2026
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Admin dashboard
              </Typography>
            </Stack>
          </Stack>
          <Divider />

          <Stack sx={{ flexGrow: 1, px: 1.5, py: 1.5, overflowY: 'auto', justifyContent: 'space-between' }}>
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
                  to="/notifications"
                  selected={location.pathname === '/notifications'}
                >
                  <ListItemIcon><NotificationsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Notifications" />
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
                  <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 600 }}>
                    ADMINISTRATION
                  </Typography>
                }
              >
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton component={NavLink} to="/users" selected={location.pathname === '/users'}>
                    <ListItemIcon><ManageAccountsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Admin users" />
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

          <Divider />
          <Stack sx={{ p: 1.5 }}>
            <OptionsMenu />
          </Stack>
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
            <Breadcrumbs separator={<ChevronRightRoundedIcon fontSize="small" />}>
              <Typography variant="body1" color="text.secondary">Copper Belt Marathon</Typography>
              <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {pageTitle}
              </Typography>
            </Breadcrumbs>
            <ColorModeIconDropdown />
          </Stack>
          <Outlet />
        </Stack>
      </Box>
    </Box>
  );
}
