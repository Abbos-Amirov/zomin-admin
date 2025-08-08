import { AppBar, Toolbar, Typography, IconButton, useMediaQuery, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const isMobile = useMediaQuery('(max-width:900px)');

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: '#2c3e50',
        zIndex: (theme) => theme.zIndex.drawer-1,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="primary"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: "#cfd8dc" }}>
          Admin Panel
        </Typography>

        {/* You can add profile/logout buttons here later */}
        <Box />
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
