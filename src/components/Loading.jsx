const LoadingComponent = () => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
    >
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-500" />
    </div>
  );
};

export default LoadingComponent;
