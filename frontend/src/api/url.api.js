import { getToken } from "../utils/token";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

export const createUrl = async (longUrl) => {
  const res = await fetch(`${BASE_URL}/api/urls`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ longUrl }),
  });
  return res.json();
};

export const getAllUrls = async () => {
  const res = await fetch(`${BASE_URL}/api/urls`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};

export const deleteUrl = async (id) => {
  const res = await fetch(`${BASE_URL}/api/urls/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

export const getAnalytics = async (id) => {
  const res = await fetch(`${BASE_URL}/api/urls/${id}/analytics`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.json();
};

//flow of the code:
// 1. The `BASE_URL` is defined using an environment variable.
// 2. The `authHeaders` function constructs the headers for authenticated requests, including the token from local storage.
// 3. The `createUrl` function sends a POST request to create a new shortened URL with the provided long URL.
// 4. The `getAllUrls` function sends a GET request to retrieve all URLs associated with the authenticated user.
// 5. The `deleteUrl` function sends a DELETE request to remove a specific URL by its ID.
// 6. The `getAnalytics` function sends a GET request to retrieve analytics data for a specific URL by its ID.

