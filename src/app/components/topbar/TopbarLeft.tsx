import { Stack, IconButton, InputBase, useTheme, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import MenuIcon from "@mui/icons-material/Menu";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

interface TopbarLeftProps {
  onMenuClick: () => void;
}

export default function TopbarLeft({ onMenuClick }: TopbarLeftProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
      {isMobile && (
        <IconButton color="primary" edge="start" onClick={onMenuClick} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
      )}

      {/* Search Box */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          flex: 1,
          maxWidth: 560,
          bgcolor: "background.default",
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <SearchRoundedIcon fontSize="small" />
        {!isMobile && (
          <InputBase
            placeholder={t("topbar.search")}
            fullWidth
            sx={{ fontSize: 14 }}
          />
        )}
      </Stack>
    </Stack>
  );
}
