"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ProjectInsert {
    project_name: string;
    project_manager: string;
    client_name: string;
    status: string;
    priority: string;
    start_date: string | null;
    due_date: string | null;
    description: string;
    attachment_url?: string | null;
    created_by: string;
}

export default function CreateNewProjectForm() {
    const [projectName, setProjectName] = useState<string>("");
    const [projectManager, setProjectManager] = useState<string>("");
    const [clientName, setClientName] = useState<string>("");
    const [status, setStatus] = useState<string>("In Progress");
    const [priority, setPriority] = useState<string>("High");
    const [startDate, setStartDate] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [description, setDescription] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [messageType, setMessageType] = useState<"error" | "success" | "info">("info");
    const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [teamLeaders, setTeamLeaders] = useState<{ id: string; name: string; department: string }[]>([]);

    useEffect(() => {
        const fetchTeamLeaders = async () => {
            const { data, error } = await supabase
                .from("users")
                .select("id, name, department, role")
                .eq("role", "team_leader");

            if (!error && data) setTeamLeaders(data as { id: string; name: string; department: string }[]);
        };
        fetchTeamLeaders();
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            if (!clientName.trim()) {
                setClientSuggestions([]);
                return;
            }
            const { data, error } = await supabase
                .from("projects")
                .select("client_name")
                .ilike("client_name", `%${clientName}%`)
                .limit(5);

            if (!error && data) {
                type ClientData = { client_name: string };
                const uniqueClients = Array.from(new Set((data as ClientData[]).map(d => d.client_name)));
                setClientSuggestions(uniqueClients);
            }

        };
        fetchClients();
    }, [clientName]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) setUploadedFile(e.target.files[0]);
    };

    const getShortFileName = (filename: string): string =>
        filename.length > 25 ? filename.slice(0, 25) + "..." : filename;

    const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");
        setMessageType("info");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMessage("You must be logged in to create a project.");
                setMessageType("error");
                setIsSubmitting(false);
                return;
            }

            let attachment_url: string | null = null;

            // Upload file first
            if (uploadedFile) {
                const fileName = `projects/${user.id}/${Date.now()}_${uploadedFile.name}`;
                const { data, error } = await supabase.storage
                    .from("project-attachments")
                    .upload(fileName, uploadedFile, {
                        cacheControl: "3600",
                        upsert: false,
                    });

                if (error) {
                    console.error("File upload error:", error);
                    setMessage("File upload failed: " + error.message);
                    setMessageType("error");
                    setIsSubmitting(false);
                    return;
                }

                const { data: publicUrlData } = supabase.storage
                    .from("project-attachments")
                    .getPublicUrl(fileName);

                attachment_url = publicUrlData.publicUrl;
            }

            const newProject: ProjectInsert = {
                project_name: projectName,
                project_manager: projectManager,
                client_name: clientName,
                status,
                priority,
                start_date: startDate || null,
                due_date: dueDate || null,
                description,
                attachment_url,
                created_by: user.id, // required for RLS
            };

            const { error } = await supabase.from("projects").insert([newProject]);

            if (error) {
                console.error("Insert error:", error);
                setMessage("Failed to create project: " + error.message);
                setMessageType("error");
            } else {
                setMessage("Project created successfully!");
                setMessageType("success");
                setProjectName("");
                setProjectManager("");
                setClientName("");
                setStatus("In Progress");
                setPriority("High");
                setStartDate("");
                setDueDate("");
                setUploadedFile(null);
                setDescription("");
            }
        } catch (err) {
            console.error(err);
            setMessage("Something went wrong.");
            setMessageType("error");
        }

        setIsSubmitting(false);
    };

    const getMessageStyles = () => {
        if (messageType === "error") return "bg-red-100 text-red-700 border border-red-200";
        if (messageType === "success") return "bg-green-100 text-green-700 border border-green-200";
        return "bg-blue-100 text-blue-700 border border-blue-200";
    };

    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Create New Project
            </h2>
      <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] mt-5 p-[25px_25px] sm:p-[35px_35px] ">
                <div className="border-b border-[#0000000D] mb-0 pb-4">
                    <h4 className="text-[#2C2C2C] text-[20px] font-medium">Project Information</h4>
                </div>

                {message && (
                    <div className="space-y-4 py-6">
                        <div
                            className={`px-6 py-3 text-sm font-medium text-center rounded-sm ${getMessageStyles()}`}
                        >
                            {message}
                        </div>
                    </div>
                )}

                <form onSubmit={handleCreateProject} className="space-y-4 py-6 pb-0">
                    {/* Project Name / Manager / Client */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                Project Name :
                            </label>
                            <input
                                type="text"
                                className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                placeholder="Enter Project Name"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                Project Manager :
                            </label>
                            <select
                                className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                                value={projectManager}
                                onChange={(e) => setProjectManager(e.target.value)}
                                required
                            >
                                <option value="">Select Project Manager</option>
                                {teamLeaders.map((leader) => (
                                    <option key={leader.id} value={leader.id}>
                                        {leader.name} ({leader.department} Team Leader)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Client Dropdown */}
                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                Client / Stakeholder :
                            </label>
                            <input
                                type="text"
                                className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                placeholder="Enter Client Name"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                onFocus={() => setShowClientDropdown(true)}
                                onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
                                required
                            />
                            {showClientDropdown && clientSuggestions.length > 0 && (
                                <div className="absolute z-50 top-full left-0 w-full mt-1 max-h-40 overflow-y-auto border border-[#567D8E33] bg-white rounded-[4px] shadow-lg">
                                    {clientSuggestions.map((client, idx) => (
                                        <div
                                            key={idx}
                                            className="px-3 py-2 cursor-pointer hover:bg-[#f0f7fb]"
                                            onMouseDown={() => setClientName(client)}
                                        >
                                            {client}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status / Priority */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Status :</label>
                            <select
                                className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option>In Progress</option>
                                <option>In Review</option>
                                <option>Completed</option>
                                <option>On Hold</option>
                            </select>
                        </div>

                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Priority:</label>
                            <select
                                className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Start / Due Date */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Start Date:</label>
                            <input
                                type="date"
                                className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]} required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Due Date:</label>
                            <input
                                type="date"
                                className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]} required
                            />
                        </div>
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Attachments:</label>
                        <div className="border border-dashed border-[#E8E8E9] rounded-[5px] px-4 py-4 text-center text-sm text-[#567D8E]">
                            <label htmlFor="file-upload" className="cursor-pointer block">
                                Drop your files here or{" "}
                                <span className="text-[#06A6F0]">click here to upload</span>
                                <br />
                                <span className="text-xs text-[#999999]">
                                    PDF, DOCX, XLXS, IMG etc files with max size 15 MB
                                </span>
                            </label>
                            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
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
                            Project Description:
                        </label>
                        <textarea
                            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            placeholder="Write project description here..." required
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer text-white bg-[#09A6F0] hover:bg-[#0784c6] rounded-[5px] px-6 py-2 font-medium w-full sm:w-auto disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
