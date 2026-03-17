import { useParams } from "react-router-dom";

const PartsInConfigurationDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Parts In Configuration Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default PartsInConfigurationDetailPage;
