import { Outlet } from "react-router-dom"
import { Header } from "../common/Header"
import { SidebarNav } from "./SidebarNav"

export default function AppLayout() {
    return (
        <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
            <SidebarNav />
            <Header />
            <Outlet />
        </div>
    )
}
