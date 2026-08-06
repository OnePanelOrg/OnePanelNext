/**
 * The loading state is the product's own gesture: panels filling in, one at a
 * time, in reading order.
 */
const LoadingComponent = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-col items-center gap-4"
    >
      <div className="grid w-40 grid-cols-3 gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <span
            key={index}
            className="h-8 animate-pulse border-2 border-paper/70 bg-paper/15 motion-reduce:animate-none"
            style={{ animationDelay: `${index * 140}ms` }}
          />
        ))}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
        Cutting panels
      </p>
    </div>
  );
};

export default LoadingComponent;
