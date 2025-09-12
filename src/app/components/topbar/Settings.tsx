import { useState } from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Switch,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";
import MemberService from "../../../services/Member.service";
import {
  sweetErrorHandling,
  sweetTopSuccessAlert,
} from "../../../lib/sweetAlert";
import { useGlobals } from "../../hooks/useGlobals";
import { frontendUrl, Messages } from "../../../lib/config";

export default function SettingsMenu({
  darkMode,
  language,
}: {
  darkMode: boolean;
  language: "EN" | "UZ";
}) {
  const { setAuthMember } = useGlobals();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /** HANDLERS **/
  const handleLogoutRequest = async () => {
    try {
      const member = new MemberService();
      await member.logout();

      await sweetTopSuccessAlert("success", 700);
      setAuthMember(null);
      window.location.href = frontendUrl as string;
    } catch (err) {
      console.log(err);
      sweetErrorHandling(Messages.error1);
    }
  };

  return (
    <>
      <Tooltip title="Settings">
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <SettingsRoundedIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ style: { width: 200 } }}
      >
        <MenuItem>
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          Theme Mode
          <Switch checked={darkMode} size="small" />
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          Language ({language})
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogoutRequest}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
