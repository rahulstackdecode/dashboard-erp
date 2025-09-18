
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

export default function CreateNewProjectForm() {
    const [projectName, setProjectName] = useState<string>("");
    const [projectManager, setProjectManager] = useState<string>("");
    const [clientName, setClientName] = useState<string>("");
    const [status, setStatus] = useState<string>("Inprogress");
    const [assignedTo, setAssignedTo] = useState<string>("");
    const [priority, setPriority] = useState<string>("High");
    const [startDate, setStartDate] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [description, setDescription] = useState<string>("");

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const getShortFileName = (filename: string): string => {
        return filename.length > 25 ? filename.slice(0, 25) + "..." : filename;
    };

    const handleCreateProject = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Form submission logic here
        console.log({
            projectName,
            projectManager,
            clientName,
            status,
            assignedTo,
            priority,
            startDate,
            dueDate,
            uploadedFile,
            description,
        });
        alert("Project Created!");
    };

    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Create New Project
            </h2>
            <div className="shadow-[0px_0px_1px_1px_#C6C6C633]">

                 <div className="border-b border-[#0000000D] mb-0 py-2 px-6 sm:px-6" >
                        <h4 className="text-[#2C2C2C] text-[20px] font-medium">
                            Project Information
                        </h4>
                    </div>

                <form onSubmit={handleCreateProject} className="space-y-4 py-6 px-6 sm:px-6">
                   
                    <div className=" flex flex-col md:flex-row gap-4">
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
                                <option>Manager 1</option>
                                <option>Manager 2</option>
                                <option>Manager 3</option>
                            </select>
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

                        <div className="flex-1">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                                Client / Stakeholder :
                            </label>
                            <input
                                type="text"
                                className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                placeholder="Enter Client Name"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Status, Assigned To, Priority */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Status :</label>
                            <select
                                className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option>Inprogress</option>
                                <option>Completed</option>
                                <option>On Hold</option>
                            </select>
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

                        <div className="flex-1 relative">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Assigned To:</label>
                            <select
                                className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                            >
                                <option value="">Select Team</option>
                                <option>Web Designer</option>
                                <option>Graphic Designer</option>
                                <option>SEO</option>
                            </select>
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

                    {/* Start Date & Due Date */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Start Date:</label>
                            <input
                                type="date"
                                className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Due Date:</label>
                            <input
                                type="date"
                                className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
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

                    {/* Project Description */}
                    <div>
                        <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">
                            Project Description:
                        </label>
                        <textarea
                            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            placeholder="Write project description here..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="cursor-pointer text-white bg-[#09A6F0] hover:bg-[#0784c6] rounded-[5px] px-6 py-2 font-medium w-full sm:w-auto"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
