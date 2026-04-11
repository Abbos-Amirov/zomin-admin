import { Badge, IconButton, InputBase, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import MenuIcon from "@mui/icons-material/Menu";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useTakeawayAckOptional } from "../../context/TakeawayAckContext";
import { retrieveLinkDinePendingAckCount } from "../../../screens/dashboardPage/selector";

interface TopbarLeftProps {
  onMenuClick: () => void;
}

export default function TopbarLeft({ onMenuClick }: TopbarLeftProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:900px)");
  const takeawayAck = useTakeawayAckOptional();
  const takeawayPending = takeawayAck?.pendingAckCount ?? 0;
  const linkDinePending = useSelector(retrieveLinkDinePendingAckCount);
  const mobileMenuBadge =
    takeawayPending + linkDinePending > 0 ? takeawayPending + linkDinePending : undefined;

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
      {isMobile && (
        <Badge
          badgeContent={mobileMenuBadge}
          color="error"
          max={99}
          overlap="circular"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            mr: 1,
            "& .MuiBadge-badge": {
              fontWeight: 800,
              fontSize: "0.65rem",
              minWidth: 18,
              height: 18,
            },
          }}
        >
          <IconButton color="primary" edge="start" onClick={onMenuClick} aria-label="Open menu">
            <MenuIcon />
          </IconButton>
        </Badge>
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
