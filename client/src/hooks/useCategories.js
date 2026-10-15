import { useEffect, useState } from "react";
import { getCategories } from "../services/categoryApi";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCategories();

        if (mounted) {
          setCategories(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load categories."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    categories,
    loading,
    error,
  };
};

export default useCategories;