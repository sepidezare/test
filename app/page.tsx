import React from "react";
import ProductList from "./components/ProductList";
import Header from "./components/Header/Header";

const page = () => {
  return (
    <main>
      <Header />
      <ProductList />
    </main>
  );
};

export default page;
