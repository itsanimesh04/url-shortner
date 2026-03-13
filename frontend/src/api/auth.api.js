const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const signup = async (data) => {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const login = async (data) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};


//flow of the code:
// 1. The `BASE_URL` is defined using an environment variable.
// 2. The `signup` function sends a POST request to the `/api/auth/signup` endpoint with the provided data in JSON format and returns the response as JSON.
// 3. The `login` function sends a POST request to the `/api/auth/login` endpoint with the provided data in JSON format and returns the response as JSON.
