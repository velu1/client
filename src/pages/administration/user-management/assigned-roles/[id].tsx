import { useParams } from "react-router-dom";

const AssignedRolesDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Assigned Roles Detail Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default AssignedRolesDetailPage;
