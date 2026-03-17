import { useParams } from "react-router-dom";

const SystemConfigDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>System Config Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default SystemConfigDetailPage;
