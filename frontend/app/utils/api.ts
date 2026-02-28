const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const apiRequest = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const token = localStorage.getItem("accessToken");

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (res.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");

        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("accessToken", data.accessToken);

            return fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {}),
                    Authorization: `Bearer ${data.accessToken}`,
                },
            });
        } else {
            localStorage.clear();
            window.location.href = "/login";
        }
    }

    return res;
};