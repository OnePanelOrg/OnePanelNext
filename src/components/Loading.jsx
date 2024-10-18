import { FaSpinner } from "react-icons/fa";

const LoadingComponent = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default LoadingComponent;
