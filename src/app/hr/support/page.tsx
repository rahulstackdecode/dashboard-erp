"use client";
import { useState } from "react";
import HelpdeskTickets from "@/app/components/hr/HelpdeskSupport";

export default function HomePage() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <h2 className="mb-0 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Helpdesk / Support Tickets  
               </h2>
            <div className="mt-8">
                <HelpdeskTickets />
            </div>

        </>
    );
}
