const BASE_URL = process.env.BACKEND_URL;

export const apiRequest = async (
    endpoint: string,
    method: string = "GET",
    body?: any,
    token?: string
) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};