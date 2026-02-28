"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiRequest } from "../utils/api";

interface Task {
    id: number;
    title: string;
    description?: string;
    status: string;
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    useEffect(() => {
        const fetchTasks = async (page = 1) => {
            try {
                const res = await apiRequest(
                    `/tasks?page=${page}&limit=6`
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message);
                }

                setTasks(data.tasks);
                setCurrentPage(data.page);
                setTotalPages(data.totalPages);

            } catch (error: any) {
                toast.error(error.message);
            }
        };

        fetchTasks(currentPage);
    }, [currentPage]);

    const handleCreateTask = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast.error("Please login again");
                return;
            }
            const res = await apiRequest(`/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            //Safe state update (prevents duplicate key warning)
            setTasks((prev) => {
                const exists = prev.some((t) => t.id === data.task.id);
                if (exists) return prev;
                return [data.task, ...prev];
            });

            setTitle("");
            setDescription("");
            //Success Toast
            toast.success("Task created successfully");

        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        }
    };


    return (
        <div className="p-4 sm:p-6 md:p-8">

            {/* Logout Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");

                        toast.success("Logged out");

                        setTimeout(() => {
                            window.location.href = "/";
                        }, 500);
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded cursor-pointer"
                >
                    Logout
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {message && <p className="text-red-500">{message}</p>}

            {/* Create Task Form */}
            <div className="mb-6 space-y-3">
                <input
                    type="text"
                    placeholder="Task Title"
                    className="border p-2 rounded w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Description"
                    className="border p-2 rounded w-full"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <button
                    onClick={handleCreateTask}
                    disabled={!title.trim()}
                    className={`px-4 py-2 rounded  text-white ${title.trim()
                        ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                        }`}
                >
                    Add Task
                </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search tasks..."
                    className="border p-2 rounded w-full mb-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {/* Filter */}
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setFilter("all")} className="px-3 py-1 bg-gray-500 text-white rounded cursor-pointer">
                        All
                    </button>
                    <button onClick={() => setFilter("pending")} className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer">
                        Pending
                    </button>
                    <button onClick={() => setFilter("completed")} className="px-3 py-1 bg-green-500 text-white rounded cursor-pointer">
                        Completed
                    </button>
                </div></div>

            {/* Task List */}
            {tasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tasks
                        .filter((task) => {
                            if (filter === "all") return true;
                            return task.status === filter;
                        })
                        .filter((task) =>
                            task.title.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((task) => (
                            <div key={task.id} className="border p-4 rounded shadow">
                                {editingId === task.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="border p-2 rounded w-full mb-2"
                                        />

                                        <input
                                            type="text"
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className="border p-2 rounded w-full mb-2"
                                        />

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <button
                                                onClick={async () => {
                                                    const token = localStorage.getItem("accessToken");

                                                    const res = await apiRequest(
                                                        `/tasks/${task.id}`,
                                                        {
                                                            method: "PATCH",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                Authorization: `Bearer ${token}`,
                                                            },
                                                            body: JSON.stringify({
                                                                title: editTitle,
                                                                description: editDescription,
                                                            }),
                                                        }
                                                    );

                                                    const data = await res.json();

                                                    if (res.ok) {
                                                        setTasks((prev) =>
                                                            prev.map((t) =>
                                                                t.id === task.id ? data.task : t
                                                            )
                                                        );

                                                        setEditingId(null);
                                                        toast.success("Task updated successfully");
                                                    } else {
                                                        toast.error(data.message || "Update failed");
                                                    }
                                                }}
                                                className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
                                            >
                                                Save
                                            </button>

                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="bg-gray-500 text-white px-3 py-1 rounded cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="font-bold">{task.title}</h2>
                                        <p>{task.description}</p>
                                    </>
                                )}
                                <p>Status: {task.status}</p>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={async () => {
                                            const token = localStorage.getItem("accessToken");

                                            const res = await apiRequest(
                                                `/tasks/${task.id}/toggle`,
                                                {
                                                    method: "PATCH",
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                }
                                            );

                                            const data = await res.json();

                                            if (res.ok) {
                                                setTasks((prev) => {
                                                    const updated = prev.map((t) =>
                                                        t.id === task.id ? data.task : t
                                                    );

                                                    return updated.sort((a, b) => {
                                                        if (a.status === b.status) return 0;
                                                        return a.status === "pending" ? -1 : 1;
                                                    });
                                                });

                                                toast.success("Task status updated");
                                            } else {
                                                toast.error(data.message || "Toggle failed");
                                            }
                                        }}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer"
                                    >
                                        Toggle
                                    </button>


                                    <button
                                        onClick={() => {
                                            setEditingId(task.id);
                                            setEditTitle(task.title);
                                            setEditDescription(task.description || "");
                                        }}
                                        className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const token = localStorage.getItem("accessToken");

                                            const res = await apiRequest(
                                                `/tasks/${task.id}`,
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                }
                                            );

                                            if (res.ok) {
                                                setTasks((prev) =>
                                                    prev.filter((t) => t.id !== task.id)
                                                );

                                                toast.success("Task deleted successfully");
                                            } else {
                                                const data = await res.json();
                                                toast.error(data.message || "Delete failed");
                                            }
                                        }}
                                        className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            <div className="flex justify-center gap-3 mt-6">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <span className="text-white">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}