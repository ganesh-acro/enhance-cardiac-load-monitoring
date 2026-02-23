import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { ThemeToggle } from "../components/common/ThemeToggle"

export default function Users({ title = "Page" }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
                <p>This module is currently under development.</p>
            </div>
        </div>
    )
}
