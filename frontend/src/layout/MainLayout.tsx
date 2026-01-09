import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem as MuiMenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    AccountCircle,
    Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/context/AuthContext';
import { menuItems } from './menuItems';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    const drawerContent = (
        <>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
                <Typography variant="h6" color="primary" noWrap sx={{ flexGrow: 1, ml: 2, fontWeight: 'bold' }}>
                    Whaticket
                </Typography>
                <IconButton onClick={handleDrawerToggle}>
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
                {menuItems.map((item) => {
                    // Check role access (case insensitive)
                    if (item.roles && user) {
                        const userRole = user.profile.toLowerCase();
                        const itemRoles = item.roles.map(r => r.toLowerCase());
                        if (!itemRoles.includes(userRole)) {
                            return null;
                        }
                    }

                    const isSelected = location.pathname === item.path;

                    return (
                        <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                selected={isSelected}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setOpen(false);
                                }}
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    '&.Mui-selected': {
                                        backgroundColor: theme.palette.primary.light + '20', // 20 value for transparency
                                        borderRight: `4px solid ${theme.palette.primary.main}`,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.light + '40',
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: isSelected ? 'primary.main' : 'inherit',
                                    }}
                                >
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
                    ml: { sm: open ? `${drawerWidth}px` : 0 },
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, ...(open && { display: { sm: 'none' } }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {menuItems.find(item => item.path === location.pathname)?.title || 'Whaticket'}
                    </Typography>

                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MuiMenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                                <ListItemIcon>
                                    <AccountCircle fontSize="small" />
                                </ListItemIcon>
                                Perfil
                            </MuiMenuItem>
                            <MuiMenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Sair
                            </MuiMenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? "temporary" : "persistent"}
                open={open}
                onClose={handleDrawerToggle}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
            >
                {drawerContent}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    marginTop: '64px',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                    minHeight: '100vh',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
