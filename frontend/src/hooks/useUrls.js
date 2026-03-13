import { useState, useEffect } from "react";
import { getAllUrls, createUrl, deleteUrl } from "../api/url.api";

const useUrls = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUrls();
      setUrls(data);
    } catch (err) {
      setError("Failed to fetch URLs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUrl = async (longUrl) => {
    setError(null);
    try {
      const newUrl = await createUrl(longUrl);
      setUrls((prev) => [newUrl, ...prev]); // add to top of list
      return newUrl;
    } catch (err) {
      setError("Failed to create URL");
    }
  };

  const handleDeleteUrl = async (id) => {
    setError(null);
    try {
      await deleteUrl(id);
      setUrls((prev) => prev.filter((url) => url._id !== id)); // remove from list
    } catch (err) {
      setError("Failed to delete URL");
    }
  };

  return { urls, loading, error, handleCreateUrl, handleDeleteUrl };
};

export default useUrls;
