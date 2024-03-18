export default function Section({
  children,
  title,
  extraClasses,
}: {
  children: React.ReactNode;
  title?: string;
  extraClasses?: string;
}) {
  return (
    <section className={`mt-4 ${extraClasses ?? ""}`}>
      {title && (
        <h2 className="pt-4 mb-4 text-lg font-semibold text-gray-900">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
