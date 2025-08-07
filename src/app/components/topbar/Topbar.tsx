import { AppBar, Toolbar, Typography } from '@mui/material';

const Topbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#2c3e50' }}>
      <Toolbar>
        <Typography variant="h6" color="inherit">
          Topbar
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
