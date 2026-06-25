import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Container, IconButton, Stack } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
import { imageBaseUrl } from "../../lib/config";

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
  const { t } = useTranslation();
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
                  <Box className="top-text">{t("menu.menuItems")}</Box>
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
                    + {t("menu.addNewProduct")}
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
                {t("menu.new")}
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
                {t("menu.price")}
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
                {t("menu.views")}
              </Button>
            </Stack>
            <Stack className="list-category-section">
              <Stack className="product-category">
                {[
                  ProductCollection.ALL,
                  ProductCollection.DISH,
                  ProductCollection.DESSERT,
                  ProductCollection.DRINK,
                  ProductCollection.SALAD,
                  ProductCollection.OTHER,
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
                    sx={{ marginTop: item === "ALL" ? "25px" : "10px" }}
                    onClick={() => searchCollectionHandler(item)}
                  >
                    {item}
                  </Button>
                ))}
              </Stack>
              <Stack className="product-wrapper">
                {products.length !== 0 ? (
                  products.map((product: Product) => {
                    const firstImage = Array.isArray(product.productImages)
                      ? product.productImages.find(
                          (img) => typeof img === "string" && img.trim() !== ""
                        ) ?? ""
                      : "";
                    const imagePath = firstImage
                      ? firstImage.startsWith("http://") || firstImage.startsWith("https://")
                        ? firstImage
                        : `${imageBaseUrl}/${firstImage}`.replace(/([^:]\/)\/+/g, "$1")
                      : "";
                    const sizeVolume =
                      product.productCollection === ProductCollection.DRINK
                        ? (product.productVolume ?? 0) + " litre"
                        : (product.productSize ?? "NORMAL") + " size";
                    const productStat = product.productStatus;
                    const isAvailable = productStat === ProductStatus.PROCESS;
                    return (
                      <Box key={product._id} className="product-card">
                        <Box className="product-img-wrap">
                          <Box
                            className="product-img"
                            sx={{ backgroundImage: `url(${imagePath})` }}
                          />
                          <span className="product-size-badge">{sizeVolume}</span>
                          <span
                            className={`product-status-badge ${
                              isAvailable ? "is-available" : "is-paused"
                            }`}
                          >
                            {productStat}
                          </span>
                        </Box>

                        <Box className="product-info">
                          <Box className="product-title" title={product.productName}>
                            {product.productName}
                          </Box>
                          <Box className="product-price-row">
                            <MonetizationOnIcon className="product-price-icon" />
                            <span className="product-price-value">
                              {product.productPrice}
                            </span>
                          </Box>
                        </Box>

                        <Box className="product-actions">
                          <Box className="product-actions-left">
                            <IconButton
                              size="small"
                              className="product-action-btn edit"
                              onClick={() => {
                                setMode(ProductDialogMode.EDIT);
                                setEdit(product);
                                setOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              className="product-action-btn delete"
                              onClick={() =>
                                productDeleteHandler({
                                  _id: product._id,
                                  productStatus: ProductStatus.DELETE,
                                  productName: product.productName,
                                })
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Button
                            size="small"
                            className={`product-toggle-btn ${
                              isAvailable ? "is-available" : "is-paused"
                            }`}
                            onClick={() =>
                              productUpdateHandler({
                                _id: product._id,
                                productStatus: isAvailable
                                  ? ProductStatus.PAUSE
                                  : ProductStatus.PROCESS,
                                existingImages: product.productImages,
                              })
                            }
                          >
                            {isAvailable
                              ? t("menu.setPause")
                              : t("menu.setProcess")}
                          </Button>
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Box className="no-data">{t("menu.productsNotAvailable")}</Box>
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
