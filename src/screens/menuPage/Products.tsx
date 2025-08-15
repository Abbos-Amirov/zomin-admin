import React, { useState } from "react";
import { Box, Button, Container, IconButton, Stack } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProductDialog from "./CreateProduct";

const products = [
  { productName: "Cutlet", imagePath: "/img/cutlet.webp" },
  { productName: "Kebab", imagePath: "/img/kebab-fresh.webp" },
  { productName: "Kebab", imagePath: "/img/kebab.webp" },
  { productName: "Lavash", imagePath: "/img/lavash.webp" },
  { productName: "Lavash", imagePath: "/img/lavash.webp" },
  { productName: "Cutlet", imagePath: "/img/cutlet.webp" },
  { productName: "Kebab", imagePath: "/img/kebab.webp" },
  { productName: "Kebab", imagePath: "/img/kebab-fresh.webp" },
];

export default function Products() {
  const [productStatus, setProductStatus] = useState("Unvailable");

  const handleEdit = () => {
    console.log("Edit clicked");
  };

  const handleDelete = () => {
    console.log("Delete clicked");
  };

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [edit, setEdit] = useState<any | undefined>(undefined); // TODO: TO IMPORT any => ENUM

  // product demo
  const sampleProduct: any = {
    productName: "Burger",
    productPrice: "8.99",
    productLeftCount: "12",
    productCollection: "DISH",
    productSize: "NORMAL",
    productVolume: undefined,
    productDesc: "Juicy beef burger",
    productImages: ["img/doner.webp", null, null, null, null],
  };

  return (
    <div className="products-page">
      <div className="products">
        <Container>
          <Stack flexDirection={"column"} alignItems={"center"} mt="15px">
            <Stack
              flexDirection={"row"}
              justifyContent={"right"}
              alignItems={"center"}
              width={"100%"}
            >
              <Stack className="avatar-big-box">
                <Box className="top-text">Menu items</Box>
                <Box>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => {
                      setMode("create");
                      setEdit(undefined);
                      setOpen(true);
                    }}
                  >
                    + Add New Product
                  </Button>
                </Box>
              </Stack>
            </Stack>
            <Stack className="dishes-filter-section">
              <Button
                variant={"contained"}
                color={"primary"}
                className={"order"}
              >
                New
              </Button>
              <Button
                variant={"contained"}
                color={"secondary"}
                className={"order"}
              >
                Price
              </Button>
              <Button
                variant={"contained"}
                color={"secondary"}
                className={"order"}
                sx={{ marginRight: "56px" }}
              >
                Views
              </Button>
            </Stack>
            <Stack className="list-category-section">
              <Stack className="product-category">
                {["DISH", "salad", "drink", "desert", "other"].map(
                  (item, i) => (
                    <Button
                      key={i}
                      variant={"contained"}
                      color={item === "DISH" ? "primary" : "secondary"}
                      className="order"
                      sx={{ marginTop: item === "DISH" ? "25px" : "10px" }}
                    >
                      {item}
                    </Button>
                  )
                )}
              </Stack>
              <Stack className="product-wrapper">
                {products.length !== 0 ? (
                  products.map((product, index) => {
                    return (
                      <Stack key={index} className="product-card">
                        <Stack
                          className="product-img"
                          sx={{ backgroundImage: `url(${product.imagePath})` }}
                        >
                          <div className="product-sale">Normal size</div>
                        </Stack>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "space-between",
                          }}
                        >
                          <Box className="product-desc">
                            <span className="product-title">
                              {product.productName}
                            </span>
                            <div className="product-desc">
                              <MonetizationOnIcon sx={{ width: "20px" }} />
                              {12}
                            </div>
                          </Box>
                          <Box
                            className="status"
                            sx={{
                              bgcolor:
                                productStatus === "Available"
                                  ? "rgb(191, 213, 191)"
                                  : "rgba(235, 192, 199, 0.894)",
                              color:
                                productStatus === "Available"
                                  ? "rgb(3, 153, 3)"
                                  : "rgb(245, 84, 84)",
                            }}
                          >
                            {productStatus}
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            mt: 1,
                          }}
                        >
                          {/* Left side: Edit + Delete */}
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setMode("edit");
                                setEdit(sampleProduct); //TODO: pass product data here
                                setOpen(true);
                              }}
                              sx={{ ml: 2 }}
                            >
                              <EditIcon fontSize="medium" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "error.main" }}
                              onClick={handleDelete}
                            >
                              <DeleteIcon fontSize="medium" />
                            </IconButton>
                          </Box>

                          {/* Right side: Mark Available / Unavailable */}
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              bgcolor:
                                productStatus === "Available"
                                  ? "error.main"
                                  : "success.main",
                              "&:hover": {
                                bgcolor:
                                  productStatus === "Available"
                                    ? "error.dark"
                                    : "success.dark",
                              },
                              textTransform: "none",
                              color: "#f8f8ff",
                            }}
                            //TODO: Click handlar
                          >
                            {productStatus === "Available"
                              ? "Mark Unavailable"
                              : "Mark Available"}
                          </Button>
                        </Box>
                      </Stack>
                    );
                  })
                ) : (
                  <Box className="no-data">Products are not available!</Box>
                )}
              </Stack>
            </Stack>
            <Stack className="pagination-section">
              <Stack spacing={2}>
                <Pagination
                  count={3}
                  renderItem={(item) => (
                    <PaginationItem
                      slots={{
                        previous: ArrowBackIcon,
                        next: ArrowForwardIcon,
                      }}
                      {...item}
                      color={"secondary"}
                    />
                  )}
                />
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </div>

      {/* DIALOG */}
      <ProductDialog
        mode={mode}
        open={open}
        onClose={() => setOpen(false)}
        initialValues={edit}
        onSubmit={(fd) => {
          if (mode === "create") {
            //TODO: POST fd to backend
            console.log("Creating:");
          } else {
            //TODO: POST fd to backend
            console.log("Updating:");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}
