import { FaSpinner } from "react-icons/fa";

const LoadingComponent = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // width: "100%",
        // height: "100vh",
        backgroundColor: "#fff",
        padding: "5rem",
      }}
    >
      <FaSpinner className="animate-spin text-4xl text-gray-500" />
      <p className="ml-2 text-gray-500">Loading</p>
    </div>
  );
};

export default LoadingComponent;
