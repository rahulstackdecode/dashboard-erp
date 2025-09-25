"use client";

import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent } from "react";
import { Search, X, ChevronDown, Edit, Eye, Download } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

/** --- Types --- */
type StatusType = "Open" | "In Progress" | "Closed";

interface TicketRow {
    id: string;
    name: string;
    department: string;
    subject: string;
    description?: string | null;
    category?: string | null;
    priority?: string | null;
    status: StatusType;
    file_url?: string | null;
    created_at: string;
}

interface DisplayTicket {
    id: string;
    name: string;
    department: string;
    subject: string;
    created: string;
    status: { label: StatusType; color: string; bgColor: string };
    description?: string | null;
    category?: string | null;
    priority?: string | null;
    file_url?: string | null;
}

const STATUS_OPTIONS: { label: StatusType; color: string; bgColor: string }[] = [
    { label: "Open", color: "#06A6F0", bgColor: "#CFE9FF" },
    { label: "In Progress", color: "#D5B500", bgColor: "#FFF4C1" },
    { label: "Closed", color: "#16A34A", bgColor: "#D1FAE5" },
];

const BUCKET_NAME = "helpdesk-images";

export default function HelpdeskTickets() {
    const [tickets, setTickets] = useState<DisplayTicket[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);

    // Form states
    const [ticketIdEditing, setTicketIdEditing] = useState<string | null>(null);
    const [subject, setSubject] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<StatusType>("Open");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const [currentUser, setCurrentUser] = useState<{ name: string; department: string } | null>(null);

    const toDisplay = (r: TicketRow): DisplayTicket => {
        const statusObj = STATUS_OPTIONS.find((s) => s.label === r.status) || STATUS_OPTIONS[0];
        return {
            id: r.id,
            name: r.name,
            department: r.department,
            subject: r.subject,
            created: new Date(r.created_at).toLocaleString(),
            status: statusObj,
            description: r.description,
            category: r.category,
            priority: r.priority,
            file_url: r.file_url ?? null,
        };
    };

    const fetchCurrentUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        const { data, error: uError } = await supabase.from("users").select("name, department").eq("auth_id", user.id).single();
        if (!uError && data) setCurrentUser({ name: data.name, department: data.department });
    };

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false }).returns<TicketRow[]>();
            if (error) throw error;
            setTickets((data ?? []).map(toDisplay));
        } catch (err) {
            console.error("fetchTickets error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchTickets();
            await fetchCurrentUser();
        };
        init();

        const channel = supabase
            .channel("public:tickets")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "tickets" },
                (payload) => {
                    console.log("Realtime update:", payload);
                    fetchTickets();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);


    const uploadFileAndGetUrl = async (file: File | null): Promise<string | null> => {
        if (!file) return fileUrl;
        const filePath = `files/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, { cacheControl: "3600", upsert: false });
        if (uploadError) return null;
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data?.publicUrl ?? null;
    };

    const openEditModal = (ticket: DisplayTicket) => {
        setTicketIdEditing(ticket.id);
        setSubject(ticket.subject);
        setPriority(ticket.priority || "Medium");
        setCategory(ticket.category || "");
        setDescription(ticket.description || "");
        setStatus(ticket.status.label);
        setFileUrl(ticket.file_url || null);
        setUploadedFile(null);
        setIsEditModalOpen(true);
    };

    const handleTicketSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !currentUser || !ticketIdEditing) return;
        setLoading(true);
        try {
            const uploadedUrl = await uploadFileAndGetUrl(uploadedFile);

            const updates: Partial<TicketRow> = {
                subject,
                priority,
                category,
                description,
                status,
            };
            if (uploadedUrl) updates.file_url = uploadedUrl;

            await supabase.from("tickets").update(updates).eq("id", ticketIdEditing);
            setTickets((prev) =>
                prev.map((t) =>
                    t.id === ticketIdEditing
                        ? { ...t, ...updates, status: STATUS_OPTIONS.find((s) => s.label === status) || t.status }
                        : t
                )
            );
            setIsEditModalOpen(false);

            // Reset form
            setTicketIdEditing(null);
            setSubject("");
            setPriority("Medium");
            setCategory("");
            setDescription("");
            setStatus("Open");
            setUploadedFile(null);
            setFileUrl(null);
        } catch (err) {
            console.error(err);
            alert("An error occurred. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatusLabel: StatusType) => {
        try {
            await supabase.from("tickets").update({ status: newStatusLabel }).eq("id", id);
            setTickets((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status: STATUS_OPTIONS.find((s) => s.label === newStatusLabel) || t.status } : t))
            );
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        } finally {
            setOpenStatusDropdown(null);
        }
    };

    const filteredData = useMemo(
        () => tickets.filter((t) => t.subject.toLowerCase().includes(searchQuery.toLowerCase())),
        [tickets, searchQuery]
    );
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize]);

    const getShortFileName = (fileName: string, maxLength = 15) => {
        if (!fileName) return "";
        if (fileName.length <= maxLength) return fileName;
        const extIndex = fileName.lastIndexOf(".");
        if (extIndex === -1) return fileName.substring(0, maxLength) + "...";
        return fileName.substring(0, maxLength - (fileName.length - extIndex)) + "..." + fileName.substring(extIndex);
    };

    return (
        <div className="attendance-wrapper">
            {/* Top bar */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center w-full sm:w-1/4 border border-[#00000033] rounded-[5px] px-3 py-2 bg-white">
                    <Search className="text-gray-400 mr-2 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Subject..."
                        className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Tickets Table */}
            <div className="overflow-x-auto overflow-y-hidden bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" style={{ padding: "35px 25px" }}>
                <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
                    <thead>
                        <tr className="text-gray-600 border-b border-gray-300">
                            <th className="px-4 py-4 text-black font-medium text-[15px]">Ticket ID</th>
                            <th className="px-4 py-4 text-black font-medium text-[15px]">Employee</th>
                            <th className="px-4 py-4 text-black font-medium text-[15px]">Department</th>
                            <th className="px-4 py-4 text-black font-medium text-[15px]">Subject</th>
                            <th className="px-4 py-4 text-black font-medium text-[15px]">Created</th>
                            <th className="px-4 py-4 text-black font-medium text-[15px] min-w-fit">Status</th>
                            <th className="px-4 py-4 text-black font-medium text-[15px] min-w-fit">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && tickets.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center px-4 py-6 text-[#567D8E]">
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((row) => (
                                <tr key={row.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                                    <td className="px-4 py-4">{row.id}</td>
                                    <td className="px-4 py-4">{row.name}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{row.department}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{row.subject}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{row.created}</td>
                                    <td className="px-4 py-4 relative min-w-fit cursor-pointer select-none">
                                        <div
                                            onClick={() => setOpenStatusDropdown(openStatusDropdown === row.id ? null : row.id)}
                                            className="inline-flex items-center justify-between w-max px-3 py-1 rounded-sm text-xs font-normal"
                                            style={{ color: row.status.color, backgroundColor: row.status.bgColor, minWidth: "min-content" }}
                                        >
                                            <span>{row.status.label}</span>
                                            <ChevronDown size={14} className="ml-1" />
                                        </div>

                                        {openStatusDropdown === row.id && (
                                            <ul className="absolute top-half left-0 -top-20 bg-white border border-gray-300 rounded-md shadow-md z-50 min-w-fit" style={{ minWidth: "min-content" }}>
                                                {STATUS_OPTIONS.map((statusOption) => (
                                                    <li
                                                        key={statusOption.label}
                                                        onClick={() => handleStatusChange(row.id, statusOption.label)}
                                                        className="px-3 py-1 cursor-pointer hover:bg-[#06A6F0] hover:text-white rounded-sm"
                                                    >
                                                        {statusOption.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => openEditModal(row)}
                                            className="cursor-pointer text-[#09A6F0] hover:text-[#0784c6] transition"
                                            title="Edit Ticket"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center px-4 py-6 text-[#567D8E]">
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Ticket Modal */}
            {isEditModalOpen && (
                <TicketModal
                    title="View Ticket Details"
                    subject={subject}
                    setSubject={setSubject}
                    priority={priority}
                    setPriority={setPriority}
                    category={category}
                    setCategory={setCategory}
                    description={description}
                    setDescription={setDescription}
                    status={status}
                    setStatus={setStatus}
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                    fileUrl={fileUrl}
                    setFileUrl={setFileUrl}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleTicketSubmit}
                    loading={loading}
                />
            )}
        </div>
    );
}

// Separate reusable modal component
interface TicketModalProps {
    title: string;
    subject: string;
    setSubject: React.Dispatch<React.SetStateAction<string>>;
    priority: string;
    setPriority: React.Dispatch<React.SetStateAction<string>>;
    category: string;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    status: StatusType;
    setStatus: React.Dispatch<React.SetStateAction<StatusType>>;
    uploadedFile: File | null;
    setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
    fileUrl: string | null;
    setFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
    onClose: () => void;
    onSubmit: (e: FormEvent) => void;
    loading: boolean;
}

function TicketModal({
    title,
    subject,
    setSubject,
    priority,
    setPriority,
    category,
    setCategory,
    description,
    setDescription,
    status,
    setStatus,
    uploadedFile,
    setUploadedFile,
    fileUrl,
    setFileUrl,
    onClose,
    onSubmit,
    loading,
}: TicketModalProps) {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUploadedFile(e.target.files?.[0] ?? null);
    };

    const getShortFileName = (fileName: string, maxLength = 15) => {
        if (!fileName) return "";
        if (fileName.length <= maxLength) return fileName;
        const extIndex = fileName.lastIndexOf(".");
        if (extIndex === -1) return fileName.substring(0, maxLength) + "...";
        return fileName.substring(0, maxLength - (fileName.length - extIndex)) + "..." + fileName.substring(extIndex);
    };

    const handleDownloadFile = async (fileUrl: string, fileName: string) => {
        try {
            const res = await fetch(fileUrl);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to download file");
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 px-4 sm:px-0 bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-[5px] w-full max-w-[650px] relative sm:mx-auto" onClick={(e) => e.stopPropagation()}>
                <button className="cursor-pointer absolute top-5 right-4 text-white bg-[#06A6F0] hover:bg-[#0784c6] rounded-full p-1 transition" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="py-3 px-5 sm:px-8 border border-[#0000001A] mb-6">
                    <h2 className="text-[#2C2C2C] font-medium text-[20px] sm:text-[30px]">{title}</h2>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 pb-8 px-5 sm:px-8">
                    <div>
                        <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Title</label>
                        <input
                            type="text"
                            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none cursor-not-allowed bg-[#F5F5F5]"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            disabled
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Priority</label>
                            <select
                                className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-[#F5F5F5] cursor-not-allowed focus:outline-none"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                disabled
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>

                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Grievance to Raise</label>
                            <select
                                className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-[#F5F5F5] cursor-not-allowed focus:outline-none"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled
                            >
                                <option value="">Select</option>
                                <option>Hardware</option>
                                <option>Software</option>
                                <option>Network</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Upload File (If Any)</label>
                        <div className="border border-dashed border-[#E8E8E9] rounded-[5px] px-4 py-4 text-center text-sm text-[#567D8E] cursor-not-allowed bg-[#F5F5F5]">
                            <label htmlFor="file-upload" className="block">
                                Drop your files here or <span className="text-[#06A6F0]">click here to upload</span>
                                <br />
                                <span className="text-xs text-[#999999]">PDF, DOCX, XLXS, IMG etc files with max size 15 MB</span>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled
                            />
                            {(uploadedFile || fileUrl) && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-[#2C2C2C] font-light justify-center">
                                    <span>{getShortFileName(uploadedFile?.name || fileUrl?.split("/").pop() || "")}</span>
                                    {fileUrl && (
                                        <>
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#06A6F0] hover:text-[#06A6F0]"
                                            >
                                                <Eye size={16} />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadFile(fileUrl, fileUrl.split("/").pop() || "file")}
                                                className="cursor-pointer text-[#06A6F0] hover:text-[#06A6F0]"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Description</label>
                        <textarea
                            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none cursor-not-allowed bg-[#F5F5F5]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            disabled
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="cursor-not-allowed text-white bg-[#09A6F0] rounded-[5px] px-6 py-2 font-medium w-full sm:w-auto"
                            disabled
                        >
                            {loading ? "Saving..." : "Submit"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
