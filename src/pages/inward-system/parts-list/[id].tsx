import { useParams } from "react-router-dom";

const PartsListDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Parts List Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default PartsListDetailPage;
