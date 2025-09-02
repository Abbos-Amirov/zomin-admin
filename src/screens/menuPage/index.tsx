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

const product = new ProductService();

/** REDUX SLICE & SELECTOR */
const actionDispatch = (dispatch: Dispatch) => ({
  setProducts: (data: Product[]) => dispatch(setProducts(data)),
});

export default function MenuPage() {
  const dispatch = useDispatch();
  const { setProducts } = actionDispatch(useDispatch());
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
      .then((data) => dispatch(updateProduct(data))) //TODO: start from here
      .catch((err) => console.log(err));
  };

  const productDeleteHandler = (input: ProductUpdateInput) => {
    product
      .updateChosenProduct(input)
      .then((data) => dispatch(removeProduct(data)))
      .catch((err) => console.log(err));
  };

  const productAddHandler = (input: ProductInput) => {
    product
      .createNewProduct(input)
      .then((data) => addProduct(data))
      .catch((err) => console.log(err));
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
        onSubmit={(fd, id?) => {
          if (mode === ProductDialogMode.CREATE) {
            //TODO: POST fd to backend
            console.log("Creating:");
          } else {
            //TODO: POST fd to backend
            console.log("Updating:");
          }
          setOpen(false);
        }}
      />
    </>
  );
}
