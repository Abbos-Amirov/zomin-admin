import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Product,
  ProductInquiry,
  ProductUpdateInput,
} from "../../lib/types/product";
import { addProduct, removeProduct, setProducts, updateProduct } from "./slice";
import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import ProductsPage from "./Prodcuts";
import {
  ProductCollection,
  ProductDialogMode,
} from "../../lib/enums/product.enums";
import ProductService from "../../services/Product.service";
import "../../css/products.css";
import ProductDialog from "./CreateProduct";
import {
  confirmDelete,
  sweetCenterSuccessAlert,
  sweetErrorHandling,
} from "../../lib/sweetAlert";

const product = new ProductService();

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setProducts: (data: Product[]) => dispatch(setProducts(data)),
  removeProduct: (data: Product) => dispatch(removeProduct(data)),
  addProduct: (data: Product) => dispatch(addProduct(data)),
  updateProduct: (data: Product) => dispatch(updateProduct(data)),
});

export default function MenuPage() {
  const { setProducts, removeProduct, addProduct, updateProduct } =
    actionDispatch(useDispatch());
  /** UseState */
  const [open, setOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<ProductDialogMode>(ProductDialogMode.CREATE);
  const [edit, setEdit] = useState<Product | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>("");
  const [productSearch, setProductSearch] = useState<ProductInquiry>({
    page: 1,
    limit: 8,
    order: "createdAt",
    productCollection: ProductCollection.ALL,
    search: "",
  });

  useEffect(() => {
    product
      .getAllProducts(productSearch)
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.warn("getAllProducts:", err);
        if (err?.response?.status !== 404 && err?.response?.status !== 504) {
          setProducts([]);
          sweetErrorHandling(err).then();
        }
      });
  }, [productSearch]);

  useEffect(() => {
    if (searchText === "") {
      setProductSearch((prev) =>
        prev.search === "" ? prev : { ...prev, search: "" }
      );
    }
  }, [searchText]);

  /** HANDLERS */

  const searchCollectionHandler = (colletion: ProductCollection) => {
    setProductSearch((prev) => ({
      ...prev,
      page: 1,
      productCollection: colletion,
    }));
  };

  const searchOrderHandler = (order: string) => {
    setProductSearch((prev) => ({ ...prev, page: 1, order }));
  };

  const searchProductHandler = () => {
    setProductSearch((prev) => ({ ...prev, search: searchText }));
  };

  const paginationHandler = (e: ChangeEvent<any>, value: number) => {
    setProductSearch((prev) => ({ ...prev, page: value }));
  };

  const productUpdateHandler = async (input: ProductUpdateInput) => {
    try {
      const data = await product.toggleProductStatus(input._id);
      updateProduct(data);
      sweetCenterSuccessAlert("Updated!", 700)
    } catch (err) {
      console.error(err);
      sweetErrorHandling(err).then();
    }
  };

  const productDeleteHandler = async (input: ProductUpdateInput) => {
    if (!(await confirmDelete(input.productName))) return;
    try {
      await product.deleteChosenProduct(input._id);
      removeProduct({ _id: input._id } as Product);
      sweetCenterSuccessAlert("Deleted", 700);
    } catch (err) {
      sweetErrorHandling(err);
      console.log(err);
    }
  };

  const handleProductSubmit = async (fd: FormData, id?: string) => {
    try {
      if (id) {
        const updated = await product.updateProduct(id, fd);
        updateProduct(updated);
        sweetCenterSuccessAlert("Updated", 700);
      } else {
        const created = await product.createNewProduct(fd);
        addProduct(created);
        sweetCenterSuccessAlert("Created", 700);
      }
    } catch (e) {
      console.error(e);
      sweetErrorHandling(e).then();
      throw e;
    }
  };
  return (
    <>
      <ProductsPage
        productSearch={productSearch}
        setSearchText={setSearchText}
        searchCollectionHandler={searchCollectionHandler}
        searchOrderHandler={searchOrderHandler}
        searchProductHandler={searchProductHandler}
        paginationHandler={paginationHandler}
        setMode={setMode}
        setEdit={setEdit}
        setOpen={setOpen}
        productUpdateHandler={productUpdateHandler}
        productDeleteHandler={productDeleteHandler}
      />

      <ProductDialog
        mode={mode}
        open={open}
        onClose={() => setOpen(false)}
        initialValues={edit}
        onSubmit={handleProductSubmit}
      />
    </>
  );
}
