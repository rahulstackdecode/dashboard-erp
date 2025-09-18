"use client";
import {
  Menu,
  Bell,
  MessageSquareMore,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null); // <- dynamic profile image

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifTimeout = useRef<NodeJS.Timeout | null>(null);
  const profileTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.id) {
        setUserEmail(session.user.email || "");

        const { data: userData, error } = await supabase
          .from("users")
          .select("name, profile_image") // <- fetch profile_image column
          .eq("auth_id", session.user.id)
          .single();

        if (!error && userData) {
          setUserName(userData.name || "Guest");
          setUserImage(userData.profile_image || null); // <- dynamic image
        } else {
          setUserName("Guest");
          console.error("Error fetching user:", error);
        }
      } else {
        setUserName("Guest");
      }
    };

    fetchUserData();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        setUserEmail(session.user.email || "");
        supabase
          .from("users")
          .select("name, profile_image")
          .eq("auth_id", session.user.id)
          .single()
          .then(({ data: userData }) => {
            if (userData) {
              setUserName(userData.name || "Guest");
              setUserImage(userData.profile_image || null);
            } else setUserName("Guest");
          });
      } else {
        setUserName("Guest");
        setUserEmail("");
        setUserImage(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifMouseEnter = () => {
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    setNotifOpen(true);
  };
  const handleNotifMouseLeave = () => {
    notifTimeout.current = setTimeout(() => setNotifOpen(false), 300);
  };

  const handleProfileMouseEnter = () => {
    if (profileTimeout.current) clearTimeout(profileTimeout.current);
    setProfileOpen(true);
  };
  const handleProfileMouseLeave = () => {
    profileTimeout.current = setTimeout(() => setProfileOpen(false), 300);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/login"); 
    else console.error("Logout error:", error.message);
  };

  return (
    <header className="topbar-header w-full sticky max-w-full top-0 h-18 bg-white border-b border-[#0000001A] flex items-center justify-between ps-8 pe-4 lg:px-8 z-10">
      {/* Left Side */}
      <div className="flex items-center gap-5">
        <button
          onClick={toggleSidebar}
          className="p-0 hidden lg:block cursor-pointer rounded text-[color:var(--heading-color)]"
        >
          <Menu size={26} />
        </button>

        <div className="search-form relative w-full sm:w-[250px] md:w-[300px] lg:w-[350px] max-w-full">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#D5D5D5] rounded-md bg-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-color)]"
          />
          <Search size={18} className="search-icon absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Notification Dropdown */}
        <div
          className="relative"
          ref={notifRef}
          onMouseEnter={handleNotifMouseEnter}
          onMouseLeave={handleNotifMouseLeave}
        >
          <button className="relative text-[#B2B2B2] cursor-pointer p-2 rounded hover:bg-[var(--primary-color)] hover:text-white transition">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF0101] border-2 border-white rounded-full"></span>
          </button>

          <div
            className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#E5E5E5] z-50 transition-all duration-300 ease-in-out
            ${notifOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
              <h4 className="font-medium text-[15px] text-[#2C2C2C]">
                Notifications <span className="text-gray-400">(03)</span>
              </h4>
              <button className="text-[var(--primary-color)] text-sm font-medium hover:underline">
                Clear All
              </button>
            </div>

            {/* Notification List */}
            <ul className="max-h-80 overflow-y-auto">
              <li className="flex items-start gap-3 px-4 py-3 border-b border-[#F1F1F1] hover:bg-gray-50">
                <span className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full text-[var(--primary-color)]">
                  <MessageSquareMore size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-[#2C2C2C]">You have requested to withdrawal</p>
                  <span className="text-xs text-gray-400">2 hrs ago</span>
                </div>
              </li>
              <li className="flex items-start gap-3 px-4 py-3 border-b border-[#F1F1F1] hover:bg-gray-50">
                <span className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full text-[var(--primary-color)]">
                  <Image
                    src={userImage || "/images/user-img.png"}
                    alt="User Img"
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-[36px] h-[36px]"
                  />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-[#2C2C2C]">A new user added in Daxa</p>
                  <span className="text-xs text-gray-400">3 hrs ago</span>
                </div>
              </li>
            </ul>

            <div className="px-4 py-3 border-t border-[#E5E5E5] text-center">
              <button className="text-[var(--primary-color)] text-sm font-medium hover:underline cursor-pointer">
                See All Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <button className="relative hidden sm:block text-[#B2B2B2] cursor-pointer p-2 rounded hover:bg-[var(--primary-color)] hover:text-white transition">
          <MessageSquareMore size={22} />
        </button>

        {/* Profile Dropdown */}
        <div
          className="relative hidden sm:block"
          ref={profileRef}
          onMouseEnter={handleProfileMouseEnter}
          onMouseLeave={handleProfileMouseLeave}
        >
          <button className="flex items-center gap-2 cursor-pointer">
            <Image
              src={userImage || "/images/user-img.png"}
              alt="User Img"
              width={40}
              height={40}
              className="rounded-full object-cover w-[40px] h-[40px]"
            />
            <span className="hidden md:flex items-center gap-1 text-[#2C2C2C]">
              {userName}
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${profileOpen ? "rotate-180" : "rotate-0"}`}
              />
            </span>
          </button>

          <div
            className={`absolute right-0 mt-3 w-64 bg-white border border-[#E5E5E5] rounded-xl shadow-lg z-50 transition-all duration-300 ease-in-out
            ${profileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
          >
            <ul className="py-2">
              <li>
                <button className="flex items-center gap-2 w-full px-4 py-2.5 text-[#2C2C2C] hover:bg-[var(--primary-color)] hover:text-white transition">
                  <User size={18} /> My Profile
                </button>
              </li>
              <li>
                <button className="flex items-center gap-2 w-full px-4 py-2.5 text-[#2C2C2C] hover:bg-[var(--primary-color)] hover:text-white transition">
                  <Settings size={18} /> Settings
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className=" cursor-pointer flex items-center gap-2 w-full px-4 py-2.5 text-[#2C2C2C] hover:bg-[var(--primary-color)] hover:text-white transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
