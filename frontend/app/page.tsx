'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter()

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            background: "#000",
            color: "white"
        }}>
            <h1><b><i>Welcome to task management system </i> </b></h1>
            <h3>Log in or create account</h3>

            <button
                onClick={() => router.push('/login')}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#2563eb",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer"
                }}
            >
                Go to login
            </button>
            <button
                onClick={() => router.push('/register')}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "#2563eb",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer"
                }}
            >
                Register yourself
            </button>
        </div>
    )
}