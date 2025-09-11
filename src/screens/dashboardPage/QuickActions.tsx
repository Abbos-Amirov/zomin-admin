import React from "react";
import { Stack, Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import TableRestaurantIcon from "@mui/icons-material/TableRestaurant";
import { useNavigate } from "react-router-dom";

type Props = {};

export default function QuickActions() {
  const navigate = useNavigate();
  /** HANDLERS **/
  const newOrderHandler = () => {
    const confirmation = window.confirm("Do you want to create new order?");
    if (confirmation) {
      window.location.href = "http://localhost:3000/products";
    }
  };

  const addTableHandler = () => navigate("/tables");
  return (
    <Stack
      flexDirection={"row"}
      margin={"40px"}
      justifyContent={"end"}
      padding={"10px"}
      gap={"30px"}
    >
      <Button
        startIcon={<AddRoundedIcon />}
        variant="contained"
        onClick={newOrderHandler}
        size="large"
      >
        New Order
      </Button>
      <Button
        startIcon={<TableRestaurantIcon />}
        variant="contained"
        onClick={addTableHandler}
        size="large"
      >
        Add table
      </Button>
    </Stack>
  );
}
