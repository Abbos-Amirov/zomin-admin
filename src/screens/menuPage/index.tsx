import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Product,
  ProductInput,
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
  ProductStatus,
} from "../../lib/enums/product.enums";
import ProductService from "../../services/Product.service";
import "../../css/products.css";
import ProductDialog from "./CreateProduct";
import {
  confirmDelete,
  sweetCenterSuccessAlert,
  sweetErrorHandling,
} from "../../lib/sweetAlert";
import Swal from "sweetalert2";

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
    productCollection: ProductCollection.DISH,
    search: "",
  });

  useEffect(() => {
    product
      .getAllProducts(productSearch)
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));
  }, [productSearch]);

  useEffect(() => {
    if (searchText === "") {
      productSearch.search = "";
      setProductSearch({ ...productSearch });
    }
  }, [searchText]);

  /** HANDLERS */

  const searchCollectionHandler = (colletion: ProductCollection) => {
    productSearch.page = 1;
    productSearch.productCollection = colletion;
    setProductSearch({ ...productSearch });
  };

  const searchOrderHandler = (order: string) => {
    productSearch.page = 1;
    productSearch.order = order;
    setProductSearch({ ...productSearch });
  };

  const searchProductHandler = () => {
    productSearch.search = searchText;
    setProductSearch({ ...productSearch });
  };

  const paginationHandler = (e: ChangeEvent<any>, value: number) => {
    productSearch.page = value;
    setProductSearch({ ...productSearch });
  };

  const productUpdateHandler = (input: ProductUpdateInput) => {
    product
      .updateChosenProduct(input)
      .then((data) => updateProduct(data))
      .catch((err) => console.log(err));
  };

  const productDeleteHandler = async (input: ProductUpdateInput) => {
    if (!(await confirmDelete(input.productName))) return;
    try {
      const data = await product.updateChosenProduct(input);
      removeProduct(data);
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
        sweetCenterSuccessAlert("Updated", 700)
      } else {
        const created = await product.createNewProduct(fd);
        addProduct(created);
        sweetCenterSuccessAlert("Created", 700)
      }
    } catch (e) {
      console.error(e);
      sweetErrorHandling(e);
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
