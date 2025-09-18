"use client";
import ProjectStats from "@/app/components/ceo/ProjectStats";
import ProjectList from "@/app/components/ceo/ProjectList";

export default function HomePage() {
    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Projects Overview
            </h2>
            {/* Dashboard Stats */}
            <ProjectStats />

            <div className="mt-10">
                <ProjectList />
            </div>
        </>
    );
}
