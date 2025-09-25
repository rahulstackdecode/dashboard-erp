"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { X } from "lucide-react";

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
      { name: "fullName", label: "Full Name", type: "text", placeholder: "Full Name" },
      { name: "mobile", label: "Mobile Number", type: "tel", placeholder: "Mobile Number" },
      { name: "email", label: "Email", type: "email" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "role", label: "Role", type: "select", options: ["Employee", "Team Leader"] },
      { name: "gender", label: "Gender", type: "select", options: ["Select Gender", "Male", "Female", "Other"] },
      { name: "address", label: "Address", type: "textarea", placeholder: "Street, building, locality..." },
      { name: "city", label: "City", type: "text", placeholder: "City" },
      { name: "state", label: "State", type: "text", placeholder: "State" },
      { name: "pinCode", label: "Pin Code", type: "text", placeholder: "Pin Code" },
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

type FormData = Record<string, string>;

type UploadedFile = { name: string; path: string };

export default function AddEmployeeForm({ authId: propAuthId }: { authId?: string }) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<FormData>({ role: "Employee" });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({});
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [authId, setAuthId] = useState<string | null>(propAuthId || null);

  // normalize old stringified file JSON
  const normalizeFiles = (raw: string | UploadedFile[] | null): UploadedFile[] => {
    if (!raw) return [];
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as UploadedFile[];
      } catch {
        return [];
      }
    }
    return raw;
  };

  useEffect(() => {
    if (!authId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.id) setAuthId(data.user.id);
        else setMessage("Authorization ID missing. Please log in.");
      });
    }
  }, [authId]);

  useEffect(() => {
    if (activeTab === 0) generateEmpId();
  }, [activeTab]);

  const generateEmpId = async () => {
    const { data: lastEmp } = await supabase
      .from("users")
      .select("empId")
      .order("empId", { ascending: false })
      .limit(1)
      .maybeSingle();

    let empId = 1;
    if (lastEmp?.empId) empId = parseInt(lastEmp.empId, 10) + 1;
    setForm((prev) => ({ ...prev, empId: empId.toString() }));
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "email" && value.trim()) {
      const { data } = await supabase.from("users").select("email").eq("email", value.trim()).maybeSingle();
      setErrors((prev) => ({
        ...prev,
        [0]: {
          ...prev[0],
          email: data ? "Email already exists" : "",
        },
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!authId || !e.target.files) return;

    setUploading(true);
    try {
      const uploadedFiles: UploadedFile[] = [];

      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${fieldName}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${authId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from("employee-docs")
          .upload(filePath, file, { upsert: true });

        if (!error && data) {
          uploadedFiles.push({ name: file.name, path: data.path });
        }
      }

      setFiles((prev) => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), ...uploadedFiles],
      }));
    } catch (err) {
      console.error(err);
      setMessage("Unexpected upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fieldName: string, filePath: string) => {
    await supabase.storage.from("employee-docs").remove([filePath]);
    setFiles((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName]?.filter((f) => f.path !== filePath) || [],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateTab = (tabIndex: number) => {
    const tab = tabs[tabIndex];
    const tabErrors: Record<string, string> = {};
    if (tab.fields) {
      tab.fields.forEach((field) => {
        if (!field.readOnly && (!form[field.name] || !form[field.name].trim())) {
          tabErrors[field.name] = `${field.label} is required`;
        }
      });
    }
    setErrors((prev) => ({ ...prev, [tabIndex]: tabErrors }));
    return Object.keys(tabErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateTab(activeTab)) return;
    setActiveTab((prev) => prev + 1);
  };

  const handlePrev = () => setActiveTab((prev) => Math.max(prev - 1, 0));

  const handleSubmitAll = async () => {
    setUploading(true);
    setMessage("");

    const allErrors: Record<number, Record<string, string>> = {};
    tabs.forEach((_, idx) => {
      const valid = validateTab(idx);
      if (!valid) allErrors[idx] = errors[idx];
    });

    if (Object.keys(allErrors).length > 0) {
      setActiveTab(Math.min(...Object.keys(allErrors).map(Number)));
      setUploading(false);
      return;
    }

    try {
      const keyMap: Record<string, string> = {
        fullName: "name",
        mobile: "mobile",
        email: "email",
        dob: "dob",
        gender: "gender",
        address: "address",
        city: "city",
        state: "state",
        pinCode: "pin_code",
        role: "role",
        empId: "empId",
        empType: "empType",
        department: "department",
        designation: "designation",
        joining_date: "joining_date",
        total_experience: "total_experience",
      };

      const saveData: Record<string, string | UploadedFile[] | null> = {};
      Object.keys(form).forEach((key) => {
        let value: string | null = form[key]?.trim() || null;
        if (key === "role") {
          value = value?.toLowerCase() === "team leader" ? "team_leader" : "employees";
        }
        saveData[keyMap[key] || key] = value;
      });

      Object.keys(files).forEach((f) => {
        if (files[f]?.length) {
          saveData[f] = files[f]; // save JSON array directly
        }
      });

      if (profileImage) saveData.profile_image = profileImage;

      const { data: existingUser } = await supabase
        .from("users")
        .select("empId")
        .eq("empId", form.empId)
        .maybeSingle();

      if (existingUser) {
        const { error } = await supabase.from("users").update(saveData).eq("empId", form.empId);
        if (error) setMessage("Failed to update: " + error.message);
        else setMessage("Employee updated successfully");
      } else {
        const { error } = await supabase.from("users").insert([saveData]);
        if (error) setMessage("Failed to save: " + error.message);
        else setMessage("Employee Profile Added Successfully");
      }
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error, check console");
    } finally {
      setUploading(false);
    }
  };

  const isNextDisabled = () => {
    const tab = tabs[activeTab];
    if (!tab.fields) return false;
    const hasEmptyField = tab.fields.some((field) => !field.readOnly && (!form[field.name] || !form[field.name].trim()));
    const emailError = errors[0]?.email;
    return hasEmptyField || !!emailError;
  };

  return (
   <>
      <h2 className="mb-6 text-2xl font-medium text-[color:var(--heading-color)] leading-snug">Add Employee</h2>
      <div className="border border-[#567D8E33] rounded-md p-6 pt-3">
        <div className="flex border-b border-[#567D8E33] mb-6 overflow-x-auto">
          {tabs.map((tab, idx) => (
            <button
              key={tab.name}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 cursor-pointer whitespace-nowrap font-medium text-[#2C2C2C] border-b-2 ${
                activeTab === idx ? "text-[#06A6F0] border-[#06A6F0]" : "border-transparent"
              } hover:text-[#06A6F0] hover:border-[#06A6F0] transition-colors duration-200`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Fields */}
        {tabs[activeTab].fields && (
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
                        value={form[field.name] || ""}
                        onChange={handleChange}
                        rows={3}
                        placeholder={field.placeholder}
                        className={inputClass}
                        readOnly={field.readOnly}
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={form[field.name] || (field.name === "role" ? "Employee" : "")}
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
                        value={form[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                        className={inputClass}
                      />
                    )}
                    {errors[activeTab]?.[field.name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[activeTab][field.name]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Uploads */}
        {tabs[activeTab].uploads && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tabs[activeTab].uploads.map((upload) => (
              <div key={upload.name} className="w-full">
                <label className="block mb-2">{upload.label}</label>
                <div className="border border-dashed border-[#E8E8E9] rounded-[5px] px-4 py-2 text-center text-sm text-[#567D8E] min-h-[100px] flex flex-col justify-center">
                  <label htmlFor={upload.name} className="cursor-pointer block">
                    Drop your files here or <span className="text-[#06A6F0]">click here to upload</span>
                    <br />
                    <span className="text-xs text-[#999999]">PDF, DOCX, XLXS, IMG etc files with max size 15 MB</span>
                  </label>
                  <input
                    id={upload.name}
                    type="file"
                    multiple={upload.name === "salary_slips"}
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, upload.name)}
                  />

                  {/* Show uploaded files list */}
                  {files[upload.name]?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 text-center">
                      {files[upload.name].map((file, idx) => (
                        <li key={idx} className="flex items-center justify-center truncate">
                          <span className="truncate max-w-[160px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(upload.name, file.path)}
                            className="cursor-pointer text-red-500 hover:text-red-700 ml-2"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className=" mt-6">
          {activeTab === tabs.length - 1 && message && (
            <p className={`mt-3 text-center ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeTab === 0}
              className={`px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200
            ${activeTab === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"}`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={activeTab === tabs.length - 1 ? handleSubmitAll : handleNext}
              disabled={uploading || isNextDisabled()}
              className={`px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200
            ${uploading || isNextDisabled() ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"}`}
            >
              {activeTab === tabs.length - 1 ? (uploading ? "Saving..." : "Submit") : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
