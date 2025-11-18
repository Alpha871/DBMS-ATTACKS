"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import {
  Code,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  path?: string;
  active?: boolean;
};

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  path = "#",
  active,
}) => {
  const pathname = usePathname();
  const isActive = typeof active === "boolean" ? active : pathname === path;

  return (
    <Link
      href={path}
      className={[
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
        isActive
          ? "bg-primary/20 dark:bg-[#392828] text-white"
          : "hover:bg-white/5 text-white",
      ].join(" ")}
    >
      <div className="w-5 h-5">{icon}</div>
      <p className="text-sm font-medium leading-normal">{label}</p>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  return (
    <aside
      className="
        fixed left-0 top-0 z-50
        h-screen w-64 flex-shrink-0
        bg-[#221010]/50 dark:bg-[#181111]
        border-r border-white/10
      "
    >
      {/* Make the inside scrollable if content overflows */}
      <div className="h-full overflow-y-auto">
        <div className="flex h-full min-h-full flex-col justify-between p-4">
          {/* Top */}
          <div className="flex flex-col gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                aria-label="VulnDB Logo"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBy_BAmTy_FjMvP5f4q1kXBQey3YoXRGQbxZAYXVTPhcW1j-l3yUiTTnBZrAwQe24MRExjbwPV-mka0yVZfjRvtNkLpLq4IeY-fX9Wb6JaajBw7pX4YfbNKCUdo-73U6MGO9MscYACd5Skvsc52DsfC3_JrgokczIRClSiFA1572XnFeM3pYMI3sVJgq8sCZ-a3uAbnD6OM_GWdDFFE4IWgGGNVS91pz_EPBO_5zYoi_z7IT4MJISwsxTLvyoGThUY5kklODa5RyJX8")',
                }}
              />
              <div className="flex flex-col">
                <h1 className="text-white text-base font-medium leading-normal">
                  VulnDB
                </h1>
                <p className="text-[#b99d9d] text-sm font-normal leading-normal">
                  Security Dashboard
                </p>
              </div>
            </div>

            {/* Nav */}
            <div className="flex flex-col gap-2 mt-4">
              <NavItem
                icon={<Code className="text-white" />}
                label="SQL Injection Demo"
                path="/"
              />
              <NavItem
                icon={<ShieldCheck className="text-white" />}
                label="Threat Simulator"
                path="/rbac"
              />
              {/* <NavItem
                icon={<LayoutDashboard className="text-white" />}
                label="Dashboard"
                path="/dashboard"
              /> */}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col gap-1">
            <NavItem
              icon={<Settings className="text-white" />}
              label="Settings"
              path="#"
            />
            <NavItem
              icon={<LogOut className="text-white" />}
              label="Logout"
              path="#"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
