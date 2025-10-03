import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  People,
  OnlinePrediction,
  OfflineBolt,
  MoreVert,
  Person,
  AdminPanelSettings,
  Security
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserPresence = ({ onlineUsers = [], socket = null }) => {
  const { userProfile, hasRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleSendMessage = () => {
    if (selectedUser && socket) {
      // Create private room for direct messaging
      const roomName = `private_${[userProfile.uid, selectedUser.id].sort().join('_')}`;
      
      socket.emit('join_chat_room', {
        roomName,
        userProfile: {
          uid: userProfile.uid,
          email: userProfile.email,
          displayName: userProfile.displayName || userProfile.email?.split('@')[0] || 'User',
          photoURL: userProfile.photoURL,
          role: userProfile.role || 'user'
        }
      });
      
      handleMenuClose();
    }
  };

  const handleViewProfile = () => {
    // TODO: Implement profile viewing
    console.log('View profile:', selectedUser);
    handleMenuClose();
  };

  const handleReportUser = () => {
    // TODO: Implement user reporting
    console.log('Report user:', selectedUser);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      case 'busy':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <OnlinePrediction />;
      case 'away':
        return <OfflineBolt />;
      case 'busy':
        return <OfflineBolt />;
      default:
        return <OfflineBolt />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return <AdminPanelSettings />;
      case 'moderator':
        return <Security />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'moderator':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatConnectionTime = (connectedAt) => {
    if (!connectedAt) return 'Unknown';
    
    const now = new Date();
    const connectedDate = new Date(connectedAt);
    const diffInMinutes = Math.floor((now - connectedDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just connected';
    if (diffInMinutes < 60) return `Connected ${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Connected ${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Connected ${diffInDays}d ago`;
  };

  return (
    <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <People color="primary" />
          <Typography variant="h6">Online Users</Typography>
          <Chip
            label={onlineUsers.length}
            color="primary"
            size="small"
          />
        </Box>
      </Box>

      {/* Users List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {onlineUsers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <People sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No users online
            </Typography>
          </Box>
        ) : (
          <List>
            {onlineUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Tooltip title={user.status || 'online'}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(user.status || 'online') + '.main',
                              border: '2px solid white'
                            }}
                          />
                        </Tooltip>
                      }
                    >
                      <Avatar
                        src={user.userProfile?.photoURL}
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.userProfile?.displayName?.charAt(0) || 'U'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" noWrap>
                          {user.userProfile?.displayName || user.userProfile?.email}
                        </Typography>
                        {user.userProfile?.role && user.userProfile.role !== 'user' && (
                          <Tooltip title={user.userProfile.role}>
                            <Chip
                              icon={getRoleIcon(user.userProfile.role)}
                              label={user.userProfile.role}
                              size="small"
                              color={getRoleColor(user.userProfile.role)}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatConnectionTime(user.connectedAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Last seen: {formatLastSeen(user.lastSeen)}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, user)}
                  >
                    <MoreVert />
                  </IconButton>
                </ListItem>
                {index < onlineUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleSendMessage}>
          <Typography variant="body2">Send Message</Typography>
        </MenuItem>
        <MenuItem onClick={handleViewProfile}>
          <Typography variant="body2">View Profile</Typography>
        </MenuItem>
        {hasRole('admin') && (
          <MenuItem onClick={handleReportUser}>
            <Typography variant="body2" color="error">
              Report User
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default UserPresence;
