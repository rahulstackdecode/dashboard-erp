"use client";

export const dynamic = "force-dynamic"; // Disable static prerendering

import { useState } from "react";
import {
  Search,
  MoreVertical,
  Trash2,
  RotateCcw,
  FileText,
  FileImage,
  FileArchive,
  File,
} from "lucide-react";

interface FileItem {
  id: number;
  title: string;
  name: string;
  size: string;
  type: "PDF" | "DOC" | "IMG" | "OTHER";
  time: string;
}

const initialReports: FileItem[] = [
  { id: 1, title: "Team Report June 2025", name: "Team_Report_June_v1.pdf", size: "2.5MB", type: "PDF", time: "2:00 PM" },
  { id: 2, title: "Team Report June 2024", name: "Team_Report_June_v1.doc", size: "1.5MB", type: "DOC", time: "1:45 PM" },
  { id: 3, title: "Team Report June 2023", name: "Team_Report_June_v1.pdf", size: "5.5MB", type: "PDF", time: "4:15 PM" },
  { id: 4, title: "Team Report June 2022", name: "Team_Report_June_v1.doc", size: "2.7MB", type: "DOC", time: "11:30 AM" },
  { id: 5, title: "Team Report June 2021", name: "Team_Report_June_v1.pdf", size: "2.9MB", type: "PDF", time: "9:00 AM" },
];

const initialRecycleBin: FileItem[] = [
  { id: 101, title: "Old Project Plan", name: "Project_Plan_2020.docx", size: "850KB", type: "DOC", time: "3:20 PM" },
  { id: 102, title: "Design Screenshot", name: "design_homepage.png", size: "1.2MB", type: "IMG", time: "10:45 AM" },
  { id: 103, title: "Financial Summary", name: "Finance_Summary_2019.pdf", size: "3.4MB", type: "PDF", time: "8:00 AM" },
];

// helpers
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
}
function getCurrentTime(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "bin">("all");
  const [reports, setReports] = useState<FileItem[]>(initialReports);
  const [recycleBin, setRecycleBin] = useState<FileItem[]>(initialRecycleBin);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newFiles: FileItem[] = Array.from(files).map((file, index) => {
      let type: FileItem["type"] = "OTHER";
      if (file.name.toLowerCase().endsWith(".pdf")) type = "PDF";
      else if (file.name.toLowerCase().endsWith(".doc") || file.name.toLowerCase().endsWith(".docx")) type = "DOC";
      else if (file.type.startsWith("image/")) type = "IMG";
      return { id: Date.now() + index, title: file.name.split(".")[0] || "Untitled File", name: file.name, size: formatFileSize(file.size), type, time: getCurrentTime() };
    });
    setReports((prev) => [...newFiles, ...prev]);
  };

  const handleDelete = (id: number) => {
    const file = reports.find((f) => f.id === id);
    if (file) {
      setReports((prev) => prev.filter((f) => f.id !== id));
      setRecycleBin((prev) => [file, ...prev]);
    }
  };

  const handleRestore = (id: number) => {
    const file = recycleBin.find((f) => f.id === id);
    if (file) {
      setRecycleBin((prev) => prev.filter((f) => f.id !== id));
      setReports((prev) => [file, ...prev]);
    }
  };

  const filteredReports = activeTab === "all"
    ? reports.filter((f) => f.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : recycleBin.filter((f) => f.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderIcon = (type: FileItem["type"]) => {
    switch (type) {
      case "PDF": return <FileText className="w-8 h-8 text-red-400" />;
      case "DOC": return <FileText className="w-8 h-8 text-yellow-500" />;
      case "IMG": return <FileImage className="w-8 h-8 text-blue-400" />;
      case "OTHER": return <FileArchive className="w-8 h-8 text-gray-400" />;
      default: return <File className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">Reports</h2>
        <div className="flex items-center border border-[#00000033] rounded-[5px] px-3 py-2 bg-white w-full sm:max-w-sm">
          <Search className="text-gray-400 mr-2 w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="border border-dashed border-[#E8E8E9] rounded-[5px] px-4 py-10 text-center text-sm text-[#567D8E] mb-8">
        <label htmlFor="file-upload" className="cursor-pointer block">
          Drop your files here or{" "}
          <span className="text-[#06A6F0]">click here to upload</span>
          <br />
          <span className="text-xs text-[#999999]">PDF, DOCX, XLXS, IMG etc files with max size 15 MB</span>
        </label>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} multiple />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={() => setActiveTab("all")} className={`text-[18px] font-medium ${activeTab === "all" ? "text-[#000]" : "text-gray-500 cursor-pointer"}`}>All Reports ({reports.length})</button>
        <button onClick={() => setActiveTab("bin")} className={`text-[18px] font-medium ${activeTab === "bin" ? "text-[#000]" : "text-gray-500 cursor-pointer"}`}>Recycle Bin ({recycleBin.length})</button>
      </div>

      {/* File List */}
      <div className="space-y-4">
        {filteredReports.map((file) => (
          <div key={file.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-sm transition border border-[#567D8E33] bg-white hover:shadow-[0_3px_5px_rgba(0,0,0,0.04)]">
            {/* Left */}
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              {renderIcon(file.type)}
              <div className="min-w-0">
                <p className="text-[#2C2C2C] text-[16px] font-medium truncate">{file.title}</p>
                <p className="text-[#626262] text-sm font-light truncate">{file.name} | {file.size}</p>
              </div>
            </div>
            {/* Right */}
            <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 relative group">
              <span className="text-sm text-gray-500 shrink-0">{file.time}</span>
              <div className="relative">
                <button className="p-1 text-gray-500 cursor-pointer hover:text-gray-700"><MoreVertical className="w-5 h-5" /></button>
                <div className="absolute right-0 top-8 bg-white shadow-md rounded w-28 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                  {activeTab === "all" ? (
                    <button onClick={() => handleDelete(file.id)} className="flex items-center gap-2 px-3 py-2 cursor-pointer w-full text-left sm:text-center text-sm rounded-sm transition border border-[#567D8E33] bg-white hover:shadow-[0_3px_5px_rgba(0,0,0,0.04)]">
                      <Trash2 className="w-4 h-4 text-red-500" /> Delete
                    </button>
                  ) : (
                    <button onClick={() => handleRestore(file.id)} className="flex items-center gap-2 px-3 py-2 cursor-pointer w-full text-left sm:text-center text-sm rounded-sm transition border border-[#567D8E33] bg-white hover:shadow-[0_3px_5px_rgba(0,0,0,0.04)]">
                      <RotateCcw className="w-4 h-4 text-green-500" /> Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && <p className="text-center py-6 text-gray-400 text-sm">No files found.</p>}
      </div>
    </div>
  );
}
