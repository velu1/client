import { useParams } from "react-router-dom";

const CompanyProfileDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Company Profile Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default CompanyProfileDetailPage;
