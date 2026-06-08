import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminForm from "../../components/admins/AdminForm";
import { getAdminById } from "../../api/admins";

const AdminIdPage = () => {
  const { id } = useParams();
  // const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);

        // For new admin creation
        if (id === "new") {
          setAdmin(null);
          setLoading(false);
          return;
        }

        // Simulate API call to fetch admin data
        const response = await getAdminById(id as string);
        setAdmin(response.data);
        // @ts-ignore
        setAdmin(mockAdmin);
      } catch (error) {
        console.error("Error fetching admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="h-full">
      <AdminForm initialData={admin || undefined} isEdit={id !== "new"} />
    </div>
  );
};

export default AdminIdPage;
