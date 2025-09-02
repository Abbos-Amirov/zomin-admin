import React, { ChangeEvent, useState } from "react";
import { Box, Button, Container, IconButton, Stack } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ProductDialog from "./CreateProduct";
import SearchIcon from "@mui/icons-material/Search";
import {
  Product,
  ProductInquiry,
  ProductUpdateInput,
} from "../../lib/types/product";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import {
  ProductCollection,
  ProductDialogMode,
  ProductStatus,
} from "../../lib/enums/product.enums";
import { retrieveProducts } from "./selector";
import { serverApi } from "../../lib/config";

const productsRetriever = createSelector(retrieveProducts, (products) => ({
  products,
}));

interface ProdcutsPageProps {
  productSearch: ProductInquiry;
  setSearchText: (searchText: string) => void;
  searchCollectionHandler: (collection: ProductCollection) => void;
  searchOrderHandler: (order: string) => void;
  searchProductHandler: () => void;
  paginationHandler: (e: ChangeEvent<any>, value: number) => void;
  setMode: (mode: ProductDialogMode) => void;
  setOpen: (isOpen: boolean) => void;
  setEdit: (edit: Product | undefined) => void;
  productUpdateHandler: (input: ProductUpdateInput) => void;
  productDeleteHandler: (input: ProductUpdateInput) => void;
}

export default function ProductsPage(props: ProdcutsPageProps) {
  const {
    productSearch,
    setSearchText,
    paginationHandler,
    searchOrderHandler,
    searchProductHandler,
    searchCollectionHandler,
    setEdit,
    setMode,
    setOpen,
    productDeleteHandler,
    productUpdateHandler,
  } = props;
  const { products } = useSelector(productsRetriever);

  const handleEdit = () => {
    console.log("Edit clicked");
  };

  const handleDelete = () => {
    console.log("Delete clicked");
  };

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
                <Box display={"flex"} flexDirection={"row"}>
                  <input
                    type="search"
                    name="singleResearch"
                    placeholder="Type here"
                    className="input"
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
                    className="input-btn"
                    endIcon={<SearchIcon />}
                    onClick={searchProductHandler}
                  >
                    Search
                  </Button>
                  <Box className="top-text">Menu items</Box>
                </Box>

                <Box>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => {
                      setMode(ProductDialogMode.CREATE);
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
                color={
                  productSearch.order === "createdAt" ? "primary" : "secondary"
                }
                className={"order"}
                onClick={() => searchOrderHandler("createdAt")}
              >
                New
              </Button>
              <Button
                variant={"contained"}
                color={
                  productSearch.order === "productPrice"
                    ? "primary"
                    : "secondary"
                }
                className={"order"}
                onClick={() => searchOrderHandler("productPrice")}
              >
                Price
              </Button>
              <Button
                variant={"contained"}
                color={
                  productSearch.order === "productViews"
                    ? "primary"
                    : "secondary"
                }
                className={"order"}
                sx={{ marginRight: "56px" }}
                onClick={() => searchOrderHandler("productViews")}
              >
                Views
              </Button>
            </Stack>
            <Stack className="list-category-section">
              <Stack className="product-category">
                {[
                  ProductCollection.DISH,
                  ProductCollection.DESSERT,
                  ProductCollection.DRINK,
                  ProductCollection.OTHER,
                  ProductCollection.SALAD,
                ].map((item, i) => (
                  <Button
                    key={i}
                    variant={"contained"}
                    color={
                      productSearch.productCollection === item
                        ? "primary"
                        : "secondary"
                    }
                    className="order"
                    sx={{ marginTop: item === "DISH" ? "25px" : "10px" }}
                    onClick={() => searchCollectionHandler(item)}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
              <Stack className="product-wrapper">
                {products.length !== 0 ? (
                  products.map((product: Product) => {
                    const imagePath = `${serverApi}/${product.productImages[0]}`;
                    const sizeVolume =
                      product.productCollection === ProductCollection.DRINK
                        ? product.productVolume + " litre"
                        : product.productSize + " size";
                    const productStat = product.productStatus;
                    return (
                      <Stack key={product._id} className="product-card">
                        <Stack
                          className="product-img"
                          sx={{ backgroundImage: `url(${imagePath})` }}
                        >
                          <div className="product-sale">{sizeVolume}</div>
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
                              {product.productPrice}
                            </div>
                          </Box>
                          <Box
                            className="status"
                            sx={{
                              bgcolor:
                                productStat === ProductStatus.PROCESS
                                  ? "rgb(191, 213, 191)"
                                  : "rgba(235, 192, 199, 0.894)",
                              color:
                                productStat === ProductStatus.PROCESS
                                  ? "rgb(3, 153, 3)"
                                  : "rgb(245, 84, 84)",
                            }}
                          >
                            {productStat}
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
                                setMode(ProductDialogMode.EDIT);
                                setEdit(product);
                                setOpen(true);
                              }}
                              sx={{ ml: 2 }}
                            >
                              <EditIcon fontSize="medium" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "error.main" }}
                              onClick={() =>
                                productDeleteHandler({
                                  _id: product._id,
                                  productStatus: ProductStatus.DELETE,
                                })
                              }
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
                                productStat === ProductStatus.PROCESS
                                  ? "error.main"
                                  : "success.main",
                              "&:hover": {
                                bgcolor:
                                  productStat === ProductStatus.PROCESS
                                    ? "error.dark"
                                    : "success.dark",
                              },
                              textTransform: "none",
                              color: "#f8f8ff",
                            }}
                            onClick={() =>
                              productUpdateHandler({
                                _id: product._id,
                                productStatus:
                                  productStat === ProductStatus.PROCESS
                                    ? ProductStatus.PAUSE
                                    : ProductStatus.PROCESS,
                              })
                            }
                          >
                            {productStat === ProductStatus.PROCESS
                              ? "SET PAUSE"
                              : "SET PROCESS"}
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
                  count={
                    products.length !== 0
                      ? productSearch.page + 1
                      : productSearch.page
                  }
                  page={productSearch.page}
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
                  onChange={paginationHandler}
                />
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </div>
    </div>
  );
}
