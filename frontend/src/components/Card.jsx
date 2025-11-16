export default function Card({ title, children }) {
  return (
    <div className="card bg-white/90 bg-base-100 shadow-md p-4 w-full max-w-full md:max-w-5xl mx-auto">
      <h3 className="text-lg font-bold text-green-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}
