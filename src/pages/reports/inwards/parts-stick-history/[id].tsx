import { useParams } from "react-router-dom";

const PartsStickHistoryDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Parts Stick History Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default PartsStickHistoryDetailPage;
