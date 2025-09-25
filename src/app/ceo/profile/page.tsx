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

const personalFields: Field[] = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "Full Name" },
    { name: "mobile", label: "Mobile Number", type: "tel", placeholder: "Mobile Number" },
    { name: "email", label: "Email", type: "email", readOnly: true },
    { name: "dob", label: "Date of Birth", type: "date" },
    { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { name: "address", label: "Address", type: "textarea", placeholder: "Street, building, locality..." },
    { name: "city", label: "City", type: "text", placeholder: "City" },
    { name: "state", label: "State", type: "text", placeholder: "State" },
    { name: "pinCode", label: "Pin Code", type: "text", placeholder: "Pin Code" },
];

type FormData = Record<string, string>;

export default function EmployeeProfileForm() {
    const [form, setForm] = useState<FormData>({});
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
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
        const keyMap: Record<string, string> = { fullName: "name", pinCode: "pin_code" };

        personalFields.forEach(field => {
            initialForm[field.name] = data[keyMap[field.name] || field.name] ?? "";
        });

        if (data?.profile_image) setProfileImage(data.profile_image);
        setForm(initialForm);
    }, []);

    useEffect(() => { fetchUserData(); }, [fetchUserData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setProfileImage(ev.target?.result as string);
        reader.readAsDataURL(file);
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
            const keyMap: Record<string, string> = { fullName: "name", pinCode: "pin_code" };

            personalFields.forEach(field => {
                let value = form[field.name]?.trim() || null;
                if (field.type === "date" && value === "") value = null;
                updates[keyMap[field.name] || field.name] = value;
            });

            if (profileImage) updates.profile_image = profileImage;

            const { error } = await supabase.from("users").update(updates).eq("auth_id", user.id);
            if (error) setMessage("Update failed: " + error.message);
            else setMessage("Profile updated successfully");
        } catch (err) {
            console.error(err);
            setMessage("Unexpected error, check console");
        } finally { setUploading(false); }
    };

    const renderField = (field: Field) => {
        const commonClasses = `w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none ${field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`;

        if (field.type === "textarea") {
            return <textarea name={field.name} value={form[field.name] || ""} onChange={handleChange} rows={3} placeholder={field.placeholder} readOnly={field.readOnly} className={commonClasses} />;
        }

        if (field.type === "select") {
            return (
                <select
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={handleChange}
                    className={`${commonClasses} appearance-none ${field.readOnly ? "bg-gray-100 pointer-events-none" : ""}`}
                >
                    {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        return <input type={field.type || "text"} name={field.name} value={form[field.name] || ""} onChange={handleChange} placeholder={field.placeholder} readOnly={field.readOnly} className={commonClasses} />;
    };

    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">Account Overview</h2>
            <div className="border border-[#567D8E33] rounded-md p-6 pt-3">

                <form onSubmit={handleSubmit}>
                    {/* Profile image section */}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                        {/* Full Name & Mobile (2 columns) */}
                        {["fullName", "mobile"].map(name => {
                            const field = personalFields.find(f => f.name === name);
                            if (!field) return null;
                            return (
                                <div key={field.name}>
                                    <label className="block mb-1">{field.label}</label>
                                    {renderField(field)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Email / DOB / Gender (3 columns) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {["email", "dob", "gender"].map(name => {
                            const field = personalFields.find(f => f.name === name);
                            if (!field) return null;
                            return (
                                <div key={field.name}>
                                    <label className="block mb-1">{field.label}</label>
                                    {renderField(field)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Address */}
                    {(() => {
                        const field = personalFields.find(f => f.name === "address");
                        if (!field) return null;
                        return (
                            <div key={field.name} className="mt-4">
                                <label className="block mb-1">{field.label}</label>
                                {renderField(field)}
                            </div>
                        );
                    })()}

                    {/* City / State / Pin Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {["city", "state", "pinCode"].map(name => {
                            const field = personalFields.find(f => f.name === name);
                            if (!field) return null;
                            return (
                                <div key={field.name}>
                                    <label className="block mb-1">{field.label}</label>
                                    {renderField(field)}
                                </div>
                            );
                        })}
                    </div>

                    {message && <div className="mt-4 text-center text-md font-medium text-green-600">{message}</div>}

                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="cursor-pointer px-5 py-2 bg-[#06A6F0] text-white border border-[#06A6F0] rounded hover:bg-[#05A1DB] hover:border-[#05A1DB] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? "Saving..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
