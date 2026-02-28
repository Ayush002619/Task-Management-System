export const apiRequest = async (
    url: string,
    options: RequestInit = {}
) => {
    let token = localStorage.getItem("accessToken");

    let res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    });

    // If access token expired
    if (res.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");

        const refreshRes = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            }
        );

        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("accessToken", data.accessToken);

            // retry original request
            return fetch(url, {
                ...options,
                headers: {
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