export default function CardWide({ title, children }) {
  return (
    <div className="bg-white shadow-md p-4 w-full max-w-3xl mx-auto rounded-xl">
      <h3 className="text-lg font-bold text-green-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}
