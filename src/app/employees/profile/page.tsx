"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

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
    fields: Field[];
};

const tabs: Tab[] = [
    {
        name: "Personal Information",
        fields: [
            { name: "fullName", label: "Full Name", type: "text", placeholder: "Full Name" },
            { name: "mobile", label: "Mobile Number", type: "tel", placeholder: "Mobile Number" },
            { name: "email", label: "Email", type: "email", readOnly: true },
            { name: "dob", label: "Date of Birth", type: "date" },
            { name: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed", "Other"] },
            { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
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
            { name: "empType", label: "Employee Type", type: "select", options: ["Full-Time", "Part-Time", "Contract"] },
            { name: "department", label: "Department", type: "select", options: ["HR", "Finance", "Engineering", "Sales"] },
            { name: "designation", label: "Designation", type: "text" },
            { name: "working_days", label: "Working Days", type: "select", options: ["5 Days", "6 Days"] },
            { name: "joining_date", label: "Joining Date", type: "date" },
        ],
    },
];

type FormData = Record<string, string>;

export default function EmployeeProfileForm() {
    const [activeTab, setActiveTab] = useState(0);
    const [form, setForm] = useState<FormData>({});
    const [uploading, setUploading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const fetchUserData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", user.id)
            .single();

        if (error) {
            console.error("Fetch error:", error);
            return;
        }

        const initialForm: FormData = {};

        // Generate Employee ID automatically if not exists
        let empId = "";
        if (data?.empId) {
            empId = data.empId;
        } else {
            const { data: lastEmp, error: lastError } = await supabase
                .from("users")
                .select("empId")
                .order("empId", { ascending: false })
                .limit(1)
                .single();

            if (!lastError && lastEmp?.empId) {
                const lastNum = parseInt(lastEmp.empId, 10);
                empId = (lastNum + 1).toString().padStart(3, "0");
            } else {
                empId = "001";
            }
        }

        tabs.forEach((tab) => {
            tab.fields.forEach((field) => {
                const keyMap: Record<string, string> = {
                    fullName: "name",
                    maritalStatus: "marital_status",
                    pinCode: "pin_code",
                    empId: "empId",
                };
                initialForm[field.name] =
                    field.name === "empId"
                        ? empId
                        : data[keyMap[field.name] || field.name] ?? "";
            });
        });

        if (data?.profile_image) {
            setProfileImage(data.profile_image);
        }

        setForm(initialForm);
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setProfileImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setMessage("");
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMessage("Login required");
                setUploading(false);
                return;
            }

            const updates: Record<string, string | null> & { profile_image?: string } = {};

            for (const tab of tabs) {
                for (const field of tab.fields) {
                    const keyMap: Record<string, string> = {
                        fullName: "name",
                        maritalStatus: "marital_status",
                        pinCode: "pin_code",
                        empId: "empId",
                    };

                    let value = form[field.name]?.trim() || null;

                    // If field is a date and empty string, set to null
                    if (field.type === "date" && value === "") {
                        value = null;
                    }

                    updates[keyMap[field.name] || field.name] = value;
                }
            }

            if (profileImage) updates.profile_image = profileImage;

            const { error } = await supabase
                .from("users")
                .update(updates)
                .eq("auth_id", user.id);

            if (error) setMessage("Update failed: " + error.message);
            else setMessage("Profile updated successfully");
        } catch (err) {
            console.error(err);
            setMessage("Unexpected error, check console");
        } finally {
            setUploading(false);
        }
    };


    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Account Overview
            </h2>
            <div className="border border-[#567D8E33] rounded-md p-6 pt-3">
                {/* Tabs */}
                <div className="flex border-b border-[#567D8E33] mb-6 overflow-x-auto">
                    {tabs.map((tab, idx) => (
                        <button
                            key={tab.name}
                            type="button"
                            onClick={() => setActiveTab(idx)}
                            className={`
                px-4 py-2 cursor-pointer whitespace-nowrap font-medium text-[#2C2C2C]
                border-b-2
                ${activeTab === idx ? "text-[#06A6F0] border-[#06A6F0]" : "border-transparent"}
                hover:text-[#06A6F0] hover:border-[#06A6F0]
                transition-colors duration-200
              `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Profile upload only in Personal tab */}
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
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    Upload Image
                                </label>
                                <p className="text-gray-500 text-sm mt-2">
                                    JPG or PNG format, not exceeding 5MB.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tabs[activeTab].fields.map((field) => {
                            if (["city", "state", "pinCode"].includes(field.name)) return null;

                            if (field.type === "textarea") {
                                return (
                                    <div key={field.name} className="col-span-1 sm:col-span-2">
                                        <label className="block mb-1">{field.label}</label>
                                        <textarea
                                            name={field.name}
                                            value={form[field.name] || ""}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                );
                            }

                            if (field.type === "select") {
                                return (
                                    <div key={field.name}>
                                        <label className="block mb-1">{field.label}</label>
                                        <select
                                            name={field.name}
                                            value={form[field.name] || ""}
                                            onChange={handleChange}
                                            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none appearance-none"
                                        >
                                            <option value="">Select {field.label}</option>
                                            {field.options?.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            }

                            return (
                                <div key={field.name}>
                                    <label className="block mb-1">{field.label}</label>
                                    <input
                                        type={field.type || "text"}
                                        name={field.name}
                                        value={form[field.name] || ""}
                                        onChange={handleChange}
                                        readOnly={field.readOnly}
                                        placeholder={field.placeholder}
                                        className={`w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none ${field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                                            }`}
                                    />
                                </div>
                            );
                        })}

                        {/* City, State, Pin Code row */}
                        <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {["city", "state", "pinCode"].map((fieldName) => {
                                const field = tabs[activeTab].fields.find((f) => f.name === fieldName);
                                if (!field) return null;
                                return (
                                    <div key={field.name} className="w-full">
                                        <label className="block mb-1">{field.label}</label>
                                        <input
                                            type="text"
                                            name={field.name}
                                            value={form[field.name] || ""}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Success / Error message */}
                    {activeTab === tabs.length - 1 && message && (
                        <div className="mt-4 text-center text-md font-medium text-green-600">
                            {message}
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
                        {activeTab > 0 && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab(activeTab - 1);
                                }}
                                className="cursor-pointer px-5 py-2 bg-white text-black border border-[#567D8E33] rounded hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition-colors duration-200"
                            >
                                Back
                            </button>
                        )}

                        {activeTab < tabs.length - 1 ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab(activeTab + 1);
                                }}
                                className="cursor-pointer px-5 py-2 bg-white text-black border border-[#567D8E33] rounded hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition-colors duration-200"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={uploading}
                                className="cursor-pointer px-5 py-2 bg-[#06A6F0] text-white border border-[#06A6F0] rounded hover:bg-[#05A1DB] hover:border-[#05A1DB] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? "Saving..." : "Submit"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}
