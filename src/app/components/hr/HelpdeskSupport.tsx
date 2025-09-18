import React, { useState, useMemo, ChangeEvent, FormEvent } from "react";
import { Search, X, Upload, ChevronDown } from "lucide-react";

type StatusType = "Open" | "In Progress" | "Closed";

interface Ticket {
    id: string;
    name: string;
    department: string;
    subject: string;
    created: string;
    status: { label: StatusType; color: string; bgColor: string };
}

const STATUS_OPTIONS: { label: StatusType; color: string; bgColor: string }[] = [
    { label: "Open", color: "#06A6F0", bgColor: "#CFE9FF" },
    { label: "In Progress", color: "#D5B500", bgColor: "#FFF4C1" },
    { label: "Closed", color: "#16A34A", bgColor: "#D1FAE5" },
];

const initialHelpdeskData: Ticket[] = [
    {
        id: "1234",
        name: "Ahmed Rashdan",
        department: "Web Designer",
        subject: "PC not turning on",
        created: "30 min ago",
        status: { label: "In Progress", color: "#D5B500", bgColor: "#FFF4C1" },
    },
    {
        id: "5678",
        name: "Ahmed Rashdan",
        department: "Web Designer",
        subject: "PC Wifi option Not Showing",
        created: "2 hour ago",
        status: { label: "Closed", color: "#16A34A", bgColor: "#D1FAE5" },
    },
    {
        id: "4321",
        name: "Ahmed Rashdan",
        department: "Web Designer",
        subject: "Monitor is blank Showing",
        created: "5 hour ago",
        status: { label: "Closed", color: "#16A34A", bgColor: "#D1FAE5" },
    },
    {
        id: "8765",
        name: "Sara Khan",
        department: "Software Engineer",
        subject: "Unable to login to system",
        created: "1 hour ago",
        status: { label: "In Progress", color: "#D5B500", bgColor: "#FFF4C1" },
    },
    {
        id: "3456",
        name: "Ali Raza",
        department: "IT Support",
        subject: "Printer not responding",
        created: "3 hour ago",
        status: { label: "In Progress", color: "#D5B500", bgColor: "#FFF4C1" },
    },
    {
        id: "7890",
        name: "Nadia Ahmed",
        department: "Marketing",
        subject: "Email not syncing",
        created: "4 hour ago",
        status: { label: "Closed", color: "#16A34A", bgColor: "#D1FAE5" },
    },
    {
        id: "6543",
        name: "Omar Sheikh",
        department: "Finance",
        subject: "Excel crashing on startup",
        created: "6 hour ago",
        status: { label: "Closed", color: "#16A34A", bgColor: "#D1FAE5" },
    },
    {
        id: "0987",
        name: "Fatima Noor",
        department: "HR",
        subject: "Cannot access leave portal",
        created: "10 hour ago",
        status: { label: "In Progress", color: "#D5B500", bgColor: "#FFF4C1" },
    },
];


export default function HelpdeskTickets() {
    const [helpdeskData, setHelpdeskData] = useState<Ticket[]>(initialHelpdeskData);
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states for modal
    const [newSubject, setNewSubject] = useState("");
    const [newPriority, setNewPriority] = useState("Medium");
    const [newCategory, setNewCategory] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newStatus, setNewStatus] = useState<StatusType>("Open");

    // Generate unique 4-digit ticket ID as string
    function generateTicketId(): string {
        let id: string;
        do {
            id = Math.floor(1000 + Math.random() * 9000).toString();
        } while (helpdeskData.some((t) => t.id === id));
        return id;
    }

    // Filter data based on subject
    const filteredData = useMemo(() => {
        return helpdeskData.filter((row) =>
            row.subject.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [helpdeskData, searchQuery]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page, pageSize]);

    // Handle creating new ticket
    const handleCreateTicket = (e: FormEvent) => {
        e.preventDefault();
        if (!newSubject.trim()) {
            alert("Subject is required.");
            return;
        }

        const newTicket: Ticket = {
            id: generateTicketId(),
            name: "Ahmed Rashdan", // You can replace this with form input if needed
            department: "Web Designer", // Same here
            subject: newSubject,
            created: "Just now",
            status: STATUS_OPTIONS.find((s) => s.label === newStatus) || STATUS_OPTIONS[0],
        };

        setHelpdeskData((prev) => [newTicket, ...prev]);
        // Reset form fields
        setNewSubject("");
        setNewPriority("Medium");
        setNewCategory("");
        setNewDescription("");
        setNewStatus("Open");
        setIsModalOpen(false);
        setPage(1);
    };

    // Handle status change in table dropdown
    const handleStatusChange = (id: string, newStatusLabel: StatusType) => {
        setHelpdeskData((prev) =>
            prev.map((ticket) =>
                ticket.id === id
                    ? {
                        ...ticket,
                        status:
                            STATUS_OPTIONS.find((s) => s.label === newStatusLabel) || ticket.status,
                    }
                    : ticket
            )
        );
    };

    // State for tracking which status dropdown is open (by ticket id)
    const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);


    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const getShortFileName = (fileName: string, maxLength = 15) => {
        if (fileName.length <= maxLength) return fileName;

        const extIndex = fileName.lastIndexOf('.');
        if (extIndex === -1) {
            return fileName.substring(0, maxLength) + '...';
        }

        const name = fileName.substring(0, maxLength - (fileName.length - extIndex));
        const ext = fileName.substring(extIndex);
        return name + '...' + ext;
    };


    return (
        <div className="attendance-wrapper">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex items-center w-full sm:w-1/5 border border-[#00000033] rounded-[5px] px-3 py-2 bg-white">
                    <Search className="text-gray-400 mr-2 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Subject......"
                        className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex cursor-pointer items-center gap-2 px-5 py-2 rounded-md text-white bg-[#09A6F0] hover:bg-[#0784c6] transition"
                >
                    Create New Ticket <span className="text-lg font-bold">+</span>
                </button>
            </div>

            {/* Ticket Table */}
            <div
                className="overflow-x-auto overflow-y-hidden bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]"
                style={{ padding: "35px 25px" }}
            >        <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
                    <thead>
                        <tr className="text-gray-600 border-b border-gray-300">
                            <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Ticket ID</th>
                            <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Employee</th>
                            <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Department</th>
                            <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Subject</th>
                            <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Created</th>
                            <th className="px-4 py-4 pt-0 text-black font-medium text-[15px] min-w-fit">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-4">{row.id}</td>
                                    <td className="px-4 py-4">{row.name}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{row.department}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{row.subject}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{row.created}</td>
                                    <td className="px-4 py-4 relative min-w-fit cursor-pointer select-none">
                                        <div
                                            onClick={() =>
                                                setOpenStatusDropdown(openStatusDropdown === row.id ? null : row.id)
                                            }
                                            className="inline-flex items-center justify-between w-max px-3 py-1 rounded-sm text-xs font-normal"
                                            style={{
                                                color: row.status.color,
                                                backgroundColor: row.status.bgColor,
                                                minWidth: "min-content"
                                            }}
                                        >
                                            <span>{row.status.label}</span>
                                            <ChevronDown size={14} className="ml-1" />
                                        </div>

                                        {openStatusDropdown === row.id && (
                                            <ul
                                                className="absolute top-half left-0 -top-20 bg-white border border-gray-300 rounded-md shadow-md z-50 min-w-fit"
                                                style={{ minWidth: "min-content" }}
                                            >
                                                {STATUS_OPTIONS.map((statusOption) => (
                                                    <li
                                                        key={statusOption.label}
                                                        onClick={() => {
                                                            handleStatusChange(row.id, statusOption.label);
                                                            setOpenStatusDropdown(null);
                                                        }}
                                                        className="px-3 py-1 cursor-pointer hover:bg-[#06A6F0] hover:text-white rounded-sm"
                                                    >
                                                        {statusOption.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center px-4 py-6 text-[#567D8E]">
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm text-gray-600 gap-4 sm:gap-0">
                <div className="flex items-center text-[#567D8E] text-[14px] font-normal justify-center sm:justify-start gap-2 flex-wrap">
                    <span>Showing</span>
                    <div className="relative inline-block">
                        <select
                            className="appearance-none border border-[#E8E8E9] text-[#2C2C2C] text-[15px] font-normal rounded-[5px] px-2 py-1 pr-6 min-w-[60px] bg-white"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                        <svg
                            className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <span>Results</span>
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className="px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"
                    >
                        Prev
                    </button>

                    <span className="px-4 py-2 bg-[#06A6F0] text-white text-[16px] font-light rounded-[5px]">
                        {page}
                    </span>

                    <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        className="px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex justify-center items-center z-50 px-4 sm:px-0"
                    style={{ backgroundColor: '#00000066' }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-[5px] w-full max-w-[650px] relative sm:mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Icon */}
                        <button
                            className="cursor-pointer absolute top-5 right-4 text-white bg-[#06A6F0] hover:bg-[#0784c6] rounded-full p-1 transition"
                            onClick={() => setIsModalOpen(false)}
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>

                        <div className="py-3 px-5 sm:px-8 border border-[#0000001A] mb-6">
                            {/* Title */}
                            <h2 className="text-[#2C2C2C] font-medium text-[20px] sm:text-[30px]">
                                Create New Ticket
                            </h2>
                        </div>

                        <form onSubmit={handleCreateTicket} className="space-y-4 pb-8 px-5 sm:px-8">
                            {/* Title Input */}
                            <div>
                                <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Priority and Grievance To Raise */}
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Priority */}
                                <div className="flex-1 relative">
                                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                        Priority
                                    </label>
                                    <select
                                        className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value)}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                    {/* Custom arrow */}
                                    <svg
                                        className="pointer-events-none absolute right-3 bottom-3.5 w-4 h-4 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>

                                {/* Grievance to Raise */}
                                <div className="flex-1 relative">
                                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                        Grievance to Raise
                                    </label>
                                    <select
                                        className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option>Hardware</option>
                                        <option>Software</option>
                                        <option>Network</option>
                                        <option>Other</option>
                                    </select>
                                    {/* Custom arrow */}
                                    <svg
                                        className="pointer-events-none absolute right-3 bottom-3.5 w-4 h-4 text-gray-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Upload */}
                            <div>
                                <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                    Upload File (If Any)
                                </label>
                                <div className="border border-dashed border-[#E8E8E9] rounded-[5px] px-4 py-4 text-center text-sm text-[#567D8E]">
                                    <label htmlFor="file-upload" className="cursor-pointer block">
                                        Drop your files here or{" "}
                                        <span className="text-[#06A6F0]">click here to upload</span>
                                        <br />
                                        <span className="text-xs text-[#999999]">
                                            PDF, DOCX, XLXS, IMG etc files with max size 15 MB
                                        </span>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {uploadedFile && (
                                        <div className="mt-2 text-sm text-[#2C2C2C] font-light">
                                            <strong>File:</strong> {getShortFileName(uploadedFile.name)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                    Description
                                </label>
                                <textarea
                                    className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="cursor-pointer text-white bg-[#09A6F0] hover:bg-[#0784c6] rounded-[5px] px-6 py-2 font-medium w-full sm:w-auto"
                                >
                                    Create Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

            )}

        </div>
    );
}
