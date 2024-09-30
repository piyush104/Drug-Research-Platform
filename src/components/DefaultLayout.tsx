'use client'

import React, {useState, useLayoutEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";


export default function DefaultLayout({
    children,
}:{
    children: React.ReactNode;
}) {
    const[sideBarOpen, setSideBarOpen] = useState(false);

    const {data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const publicRoutes = [
        "/auth-page/signin",
        "/auth-page/signup",
        "/verify-email",
        "/forgot-password",
    ];

    useLayoutEffect(() => {
        if(status === "unauthenticated" && !publicRoutes.includes(pathname)) {
            router.push("/auth-page/signin");
        }
    }, [status, router, pathname]);

    return (
        <>
            <div className="flex">
                <Sidebar sidebarOpen={sideBarOpen} setSidebarOpen={setSideBarOpen} />
                <div className="relative flex flex-1 flex-col lg:ml-72.5">
                    <Header sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
                    <main>
                        <div className="mx-auto max-w-screen-2xl p-4 dark:bg-[#121212] md:p-6 2xl:p-10">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );

}