import { Storefront } from "./components/storefront";
import { products } from "./data/products";

export default function Home() {
  return <Storefront catalog={products} />;
}
