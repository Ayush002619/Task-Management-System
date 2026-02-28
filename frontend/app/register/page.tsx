"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { apiRequest } from "@/utils/api";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await apiRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Registration failed");
                return;
            }

            toast.success("Registration successful");

            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);

        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form
                onSubmit={handleRegister}
                className="flex flex-col gap-4 p-8 shadow-lg rounded-lg w-80"
            >
                <h1 className="text-2xl font-bold">Register</h1>

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
                    className="bg-blue-500 text-white p-2 rounded cursor-pointer"
                >
                    Register
                </button>

                {message && <p className="text-sm">{message}</p>}
            </form>
        </div>
    );
}