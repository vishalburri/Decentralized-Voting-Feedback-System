import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Box,
    Divider,
    AppBar,
    Toolbar,
    Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CloseIcon from '@mui/icons-material/Close';
import { NavLink } from 'react-router-dom';

const Navbar = ({ isAdmin }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const navLinks = isAdmin
        ? [
            { to: '/', text: 'Home', icon: <HomeIcon /> },
            { to: '/Verification', text: 'Verify Voter', icon: <HowToVoteIcon /> },
            { to: '/AddCandidate', text: 'Add Candidate', icon: <HowToVoteIcon /> },
            { to: '/Results', text: 'Results', icon: <BarChartIcon /> },
            { to: '/Feedback', text: 'Create Course Feedback', icon: <FeedbackIcon /> },
        ]
        : [
            { to: '/', text: 'Home', icon: <HomeIcon /> },
            { to: '/Registration', text: 'Join Election', icon: <HowToVoteIcon /> },
            { to: '/Voting', text: 'Vote', icon: <HowToVoteIcon /> },
            { to: '/Results', text: 'Results', icon: <BarChartIcon /> },
            { to: '/Feedback', text: 'Course Feedback', icon: <FeedbackIcon /> },
        ];

    return (
        <>
            <AppBar position="static" style={{ backgroundColor: '#455a64' }}>
                <Toolbar disableGutters>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => setDrawerOpen(true)}
                        sx={{ width: '26px', marginLeft: '35px' }}
                    >
                        <MenuIcon />
                        <Typography variant="h6" color="inherit" style={{ marginLeft: '5px' }}>
                            Menu
                        </Typography>
                    </IconButton>
                    <Typography variant="h6" color="inherit" style={{ marginLeft: '595px' }}>
                        Voting and Feedback System
                    </Typography>

                </Toolbar>
            </AppBar>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box
                    width={250}
                    role="presentation"
                    onClick={() => setDrawerOpen(false)}
                    onKeyDown={() => setDrawerOpen(false)}
                >
                    <List>
                        <ListItem button key="close" onClick={() => setDrawerOpen(false)}>
                            <ListItemIcon>
                                <CloseIcon />
                            </ListItemIcon>
                            <ListItemText primary="Close" />
                        </ListItem>
                        <Divider />
                        {navLinks.map((link, index) => (
                            <ListItem button key={index} component={NavLink} to={link.to} exact>
                                <ListItemIcon>{link.icon}</ListItemIcon>
                                <ListItemText primary={link.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
};

export default Navbar;
