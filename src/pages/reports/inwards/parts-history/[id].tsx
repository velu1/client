import { useParams } from "react-router-dom";

const PartsHistoryDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Parts History Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default PartsHistoryDetailPage;
