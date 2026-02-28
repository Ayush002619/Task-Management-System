"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiRequest } from "@/utils/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await apiRequest(`${process.env.BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            } else {
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                toast.success("Welcome to taskmanager dashboard");


            }

            // Store tokens
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            router.push("/dashboard");

        } catch (error: any) {
            setMessage(error.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form
                onSubmit={handleLogin}
                className="flex flex-col gap-4 p-8 shadow-lg rounded-lg w-80"
            >
                <h1 className="text-2xl font-bold">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded cursor-pointer"
                >
                    Login
                </button>

                {message && <p className="text-sm text-red-500">{message}</p>}
            </form>
        </div>
    );
}