import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Palette as DesignIcon,
  Storage as DatabaseIcon,
  Menu as MenuIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleSidebar } from '../../store/slices/uiSlice';

const drawerWidth = 240;

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Meine Projekte', icon: <FolderIcon />, path: '/projects' },
    { text: 'Aquarium Designer', icon: <DesignIcon />, path: '/designer' },
    { text: 'Datenbank', icon: <DatabaseIcon />, path: '/database' }
  ];

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // Explizite sx-Props Definition - LÖSUNG FÜR TS2590
  const mainContainerSx: SxProps<Theme> = { 
    display: 'flex' 
  };

  const appBarSx: SxProps<Theme> = { 
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.primary.main,
  };

  const drawerSx: SxProps<Theme> = { 
    width: sidebarOpen ? drawerWidth : 0,
    flexShrink: 0,
    '& .MuiDrawer-paper': { 
      width: drawerWidth, 
      boxSizing: 'border-box',
      backgroundColor: theme.palette.background.paper,
    }
  };

  const drawerContentSx: SxProps<Theme> = { 
    overflow: 'auto' 
  };

  const mainContentSx: SxProps<Theme> = { 
    flexGrow: 1, 
    p: 3,
    marginLeft: sidebarOpen ? 0 : `-${drawerWidth}px`,
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  };

  return (
    <Box sx={mainContainerSx}>
      <AppBar position="fixed" sx={appBarSx}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={handleToggleSidebar}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            🐟 Aquarium Planer
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer variant="persistent" open={sidebarOpen} sx={drawerSx}>
        <Toolbar />
        <Box sx={drawerContentSx}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton 
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light + '20',
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box component="main" sx={mainContentSx}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
