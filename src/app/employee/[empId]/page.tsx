"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Download, Eye, X } from "lucide-react";

type FormFieldType = "text" | "email" | "tel" | "date" | "select" | "textarea";

type Field = {
  name: string;
  label: string;
  type?: FormFieldType;
  options?: string[];
  readOnly?: boolean;
  placeholder?: string;
};

type Tab = {
  name: string;
  fields?: Field[];
  uploads?: { name: string; label: string }[];
};

const tabs: Tab[] = [
  {
    name: "Personal Information",
    fields: [
      { name: "name", label: "Full Name", type: "text", placeholder: "Full Name" },
      { name: "mobile", label: "Mobile Number", type: "tel", placeholder: "Mobile Number" },
      { name: "email", label: "Email", type: "email" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "role", label: "Role", type: "select", options: ["Employee", "Team Leader"] },
      { name: "gender", label: "Gender", type: "select", options: ["Select Gender", "Male", "Female", "Other"] },
      { name: "address", label: "Address", type: "textarea", placeholder: "Street, building, locality..." },
      { name: "city", label: "City", type: "text", placeholder: "City" },
      { name: "state", label: "State", type: "text", placeholder: "State" },
      { name: "pin_code", label: "Pin Code", type: "text", placeholder: "Pin Code" },
    ],
  },
  {
    name: "Professional Information",
    fields: [
      { name: "empId", label: "Employee ID", type: "text", readOnly: true },
      { name: "empType", label: "Employee Type", type: "select", options: ["Select", "Full-Time", "Part-Time", "Contract"] },
      { name: "department", label: "Department", type: "select", options: ["Select", "HR", "Web Designer", "Web Developer", "Sales", "SEO"] },
      { name: "designation", label: "Position", type: "text" },
      { name: "joining_date", label: "Joining Date", type: "date" },
      { name: "total_experience", label: "Previous Experience", type: "text", placeholder: "e.g. 3 Years" },
    ],
  },
  {
    name: "Documents",
    uploads: [
      { name: "appointment_letter", label: "Upload Appointment Letter" },
      { name: "salary_slips", label: "Upload Salary Slips" },
      { name: "relieving_letter", label: "Upload Relieving Letter" },
      { name: "experience_letter", label: "Upload Experience Letter" },
    ],
  },
];

type FileData = { name: string; path: string };

type FormData = {
  [key: string]: string | FileData | FileData[] | undefined;
  profile_image?: string;
  appointment_letter?: string | FileData | FileData[];
  salary_slips?: string | FileData | FileData[];
  relieving_letter?: string | FileData | FileData[];
  experience_letter?: string | FileData | FileData[];
};

export default function EmployeeDetailsForm() {
  const params = useParams();
  const rawId = Array.isArray(params?.empId) ? params.empId[0] : params?.empId;
  const authId = rawId?.trim();

  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<FormData>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authId || isNaN(Number(authId))) {
      setMessage("Invalid Employee ID.");
      return;
    }
    fetchEmployeeData();
  }, [authId]);

  const fetchEmployeeData = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", Number(authId))
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setMessage("No employee found with this ID.");
        return;
      }

      const cleanData = JSON.parse(JSON.stringify(data)) as FormData;
      setForm(cleanData);
      if (cleanData.profile_image) setProfileImage(cleanData.profile_image);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Failed to fetch employee data.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (!files || !authId) return;

    setUploading(true);
    try {
      const uploadedFiles: FileData[] = [];
      for (const file of Array.from(files)) {
        const fileName = `${fieldName}_${Date.now()}_${file.name}`;
        const filePath = `${authId}/${fileName}`;
        const { data, error } = await supabase.storage.from("employee-docs").upload(filePath, file, { upsert: true });

        if (error) setMessage("File upload failed: " + error.message);
        else if (data?.path) uploadedFiles.push({ name: file.name, path: data.path });
      }

      setForm((prev) => {
        const existing = Array.isArray(prev[fieldName]) ? prev[fieldName] as FileData[] : [];
        return { ...prev, [fieldName]: [...existing, ...uploadedFiles] };
      });
    } catch {
      setMessage("Unexpected upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (fieldName: string, idx: number) => {
    setForm((prev) => {
      const files = Array.isArray(prev[fieldName]) ? [...prev[fieldName] as FileData[]] : [];
      files.splice(idx, 1);
      return { ...prev, [fieldName]: files };
    });
  };

  const handleSubmit = async () => {
    if (!authId) return;
    setUploading(true);
    setMessage("");

    try {
      const userId = Number(authId);
      if (isNaN(userId)) {
        setMessage("Invalid Employee ID.");
        setUploading(false);
        return;
      }

      const saveData: Record<string, unknown> = {
        ...form,
        role: typeof form.role === "string" && form.role.toLowerCase() === "team leader" ? "team_leader" : "employees",
      };

      if (profileImage) saveData.profile_image = profileImage;

      const jsonbFields = ["appointment_letter", "salary_slips", "relieving_letter", "experience_letter"];
      jsonbFields.forEach((field) => {
        if (saveData[field] && !Array.isArray(saveData[field])) saveData[field] = [saveData[field]];
        if (!saveData[field]) saveData[field] = null;
      });

      const { data, error } = await supabase.from("users").update(saveData).eq("id", userId).select();
      if (error) setMessage("Failed to update: " + error.message);
      else {
        setMessage("Employee updated successfully!");
        if (data && data.length > 0) {
          setForm(data[0] as FormData);
          if (data[0].profile_image) setProfileImage(data[0].profile_image);
        }
      }
    } catch {
      setMessage("Unexpected error");
    } finally {
      setUploading(false);
    }
  };

  const getFileUrls = (fileData?: string | FileData | (string | FileData)[]): string[] => {
    if (!fileData) return [];
    if (Array.isArray(fileData)) {
      return fileData.map((f) => typeof f === "string" ? supabase.storage.from("employee-docs").getPublicUrl(f).data.publicUrl : supabase.storage.from("employee-docs").getPublicUrl(f.path).data.publicUrl);
    }
    if (typeof fileData === "object" && "path" in fileData) return [supabase.storage.from("employee-docs").getPublicUrl(fileData.path).data.publicUrl];
    if (typeof fileData === "string") return [supabase.storage.from("employee-docs").getPublicUrl(fileData).data.publicUrl];
    return [];
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <>
      <h2 className="mb-6 text-2xl font-medium text-[color:var(--heading-color)] leading-snug">
        Employee Details
      </h2>

      <div className="border border-[#567D8E33] rounded-md p-6 pt-3">
        {/* Tabs */}
        <div className="flex border-b border-[#567D8E33] mb-6 overflow-x-auto">
          {tabs.map((tab, idx) => (
            <button
              key={tab.name}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 cursor-pointer whitespace-nowrap font-medium text-[#2C2C2C] border-b-2 ${activeTab === idx ? "text-[#06A6F0] border-[#06A6F0]" : "border-transparent"
                } hover:text-[#06A6F0] hover:border-[#06A6F0] transition-colors duration-200`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Fields */}
        {tabs[activeTab]?.fields && (
          <div>
            {activeTab === 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={profileImage || "/images/user-img.png"}
                    alt="Profile"
                    width={96}
                    height={96}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <label className="cursor-pointer inline-block bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-md">
                    <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} />
                    Upload Image
                  </label>
                  <p className="text-gray-500 text-sm mt-2">JPG or PNG format, not exceeding 5MB.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tabs[activeTab].fields.map((field) => {
                const colClass = field.type === "textarea" ? "col-span-1 md:col-span-3" : "col-span-1";
                const inputClass =
                  "w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 focus:outline-none" +
                  (field.readOnly ? " bg-gray-100 cursor-not-allowed" : "");
                return (
                  <div key={field.name} className={colClass}>
                    <label className="block mb-1">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={(form[field.name] as string) || ""}
                        onChange={handleChange}
                        rows={3}
                        placeholder={field.placeholder}
                        className={inputClass}
                        readOnly={field.readOnly}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={(form[field.name] as string) || ""}
                        onChange={handleChange}
                        className={inputClass}
                        disabled={field.readOnly}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                    ) : (
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={(form[field.name] as string) || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                        className={inputClass}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Uploads */}
        {tabs[activeTab]?.uploads && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {tabs[activeTab].uploads.map((upload) => {
              const rawFiles = form[upload.name];
              const filesArray: (FileData | string)[] = Array.isArray(rawFiles)
                ? rawFiles
                : rawFiles
                  ? [rawFiles]
                  : [];

              return (
                <div key={upload.name} className="w-full h-full flex flex-col">
                  <label className="block mb-2">{upload.label}</label>
                  <div className=" flex gap-2 justify-center border border-dashed border-[#E8E8E] rounded-[5px] px-4 py-3 text-center text-sm text-[#567D8E] flex-1 flex flex-col justify-center min-h-[100px]">
                    <div className="">
                      <label htmlFor={upload.name} className="cursor-pointer block">
                        Drop your files here or <span className="text-[#06A6F0]">click here to upload</span>
                        <br />
                        <span className="text-xs text-[#999999]">PDF, DOCX, XLXS, IMG etc files with max size 15 MB</span>
                      </label>
                      <input id={upload.name} type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e, upload.name)} />
                    </div>

                    {filesArray.length > 0 && (
                      <div className="space-y-1 text-xs text-gray-600 text-left">
                        {filesArray.map((f, idx) => {
                          const urls = getFileUrls(f);
                          const fileName = typeof f === "string" ? f : f.name || `file_${idx}`;
                          return (
                            <div key={idx} className="flex items-center justify-center gap-2 truncate">
                              <p className="truncate">{fileName}</p>
                              <div className="flex items-center gap-2">
                                {urls.map((u, i) => (
                                  <React.Fragment key={i}>
                                    <a href={u} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-blue-500">
                                      <Eye size={16} />
                                    </a>
                                    <button onClick={() => handleDownload(u, fileName)} className="cursor-pointer text-green-500">
                                      <Download size={16} />
                                    </button>
                                  </React.Fragment>
                                ))}
                                <button type="button" onClick={() => handleRemoveFile(upload.name, idx)} className="cursor-pointer text-red-500">
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          {activeTab > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab - 1)}
              className="cursor-pointer px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition-colors duration-200"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={activeTab === tabs.length - 1 ? handleSubmit : () => setActiveTab(activeTab + 1)}
            disabled={uploading}
            className="cursor-pointer px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition-colors duration-200"
          >
            {activeTab === tabs.length - 1 ? (uploading ? "Saving..." : "Update") : "Next"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className={`mt-3 text-center ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </>
  );
}
