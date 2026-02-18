import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { OrderInquiry } from "../../lib/types/order";
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "../../lib/enums/order.enum";

interface OrdersFiltersProps {
  orderSearch: OrderInquiry;
  setOrderSearch: (input: OrderInquiry) => void;
}

export default function OrdersFilters(props: OrdersFiltersProps) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string>("");

  const { orderSearch, setOrderSearch } = props;

  useEffect(() => {
    if (searchText === "") {
      orderSearch.search = "";
      setOrderSearch({ ...orderSearch });
    }
  }, [searchText]);

  /** HANDLERS **/
  const searchProductHandler = () => {
    orderSearch.search = searchText;
    setOrderSearch({ ...orderSearch });
  };

  const searchOrderTypeHandler = (type: OrderType) => {
    orderSearch.page = 1;
    orderSearch.type = type;
    setOrderSearch({ ...orderSearch });
  };

  const searchOrderStatusHandler = (status: OrderStatus) => {
    orderSearch.page = 1;
    orderSearch.status = status;
    setOrderSearch({ ...orderSearch });
  };

  const searchPayStatusHandler = (status: PaymentStatus) => {
    orderSearch.page = 1;
    orderSearch.payStatus = status;
    setOrderSearch({ ...orderSearch });
  };

  const searchPayMethodHandler = (method: PaymentMethod) => {
    orderSearch.page = 1;
    orderSearch.payMeth = method;
    setOrderSearch({ ...orderSearch });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent={"space-between"}
      >
        <Box>
          <input
            type="search"
            name="singleResearch"
            placeholder={t("users.typeHere")}
            className="search-input"
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchProductHandler();
            }}
          />
          <Button
            variant="contained"
            color="primary"
            className="search-input-btn"
            endIcon={<SearchIcon />}
            onClick={searchProductHandler}
          >
            {t("menu.search")}
          </Button>
        </Box>
        <Box display={"flex"} gap={"5px"}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>{t("orders.type")}</InputLabel>
            <Select
              label={t("orders.type")}
              value={orderSearch.type || ""}
              onChange={(e) => searchOrderTypeHandler(e.target.value as any)}
            >
              <MenuItem value="">{t("orders.all")}</MenuItem>
              <MenuItem value="TABLE">TABLE</MenuItem>
              <MenuItem value="DELIVERY">DELIVERY</MenuItem>
              <MenuItem value="TAKEOUT">TAKEOUT</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t("orders.status")}</InputLabel>
            <Select
              label={t("orders.status")}
              value={orderSearch.status || ""}
              onChange={(e) => searchOrderStatusHandler(e.target.value as any)}
            >
              <MenuItem value="">{t("orders.all")}</MenuItem>
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="PROCESS">PROCESS</MenuItem>
              <MenuItem value="SERVED">SERVED</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>{t("orders.paymentStatus")}</InputLabel>
            <Select
              label={t("orders.paymentStatus")}
              value={orderSearch.payStatus || ""}
              onChange={(e) => searchPayStatusHandler(e.target.value as any)}
            >
              <MenuItem value="">{t("orders.all")}</MenuItem>
              <MenuItem value="UNPAID">UNPAID</MenuItem>
              <MenuItem value="PAID">PAID</MenuItem>
              <MenuItem value="REFUNDED">REFUNDED</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>{t("orders.method")}</InputLabel>
            <Select
              label={t("orders.method")}
              value={orderSearch.payMeth || ""}
              onChange={(e) => searchPayMethodHandler(e.target.value as any)}
            >
              <MenuItem value="">{t("orders.all")}</MenuItem>
              <MenuItem value="CASH">CASH</MenuItem>
              <MenuItem value="CARD">CARD</MenuItem>
              <MenuItem value="TRANSFER">TRANSFER</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
    </Paper>
  );
}
