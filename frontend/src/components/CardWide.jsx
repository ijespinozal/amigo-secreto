import Card from "./Card";

/** Variante ancha de Card (tablas). */
export default function CardWide({ className = "", ...props }) {
  return <Card className={`max-w-5xl mx-auto ${className}`} {...props} />;
}
