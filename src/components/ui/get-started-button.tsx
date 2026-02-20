import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GetStartedButtonProps {
    label?: string;
    href?: string;
    className?: string;
    size?: "default" | "sm" | "lg" | "icon";
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function GetStartedButton({
    label = "Get Started",
    className,
    size = "lg",
    variant = "default",
}: GetStartedButtonProps) {
    return (
        <Button
            className={cn("group relative overflow-hidden rounded-full", className)}
            size={size}
            variant={variant}
        >
            <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0">
                {label}
            </span>
            <i className="absolute right-1 top-1 bottom-1 rounded-full z-10 grid w-1/4 place-items-center transition-all duration-500 bg-primary-foreground/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </i>
        </Button>
    );
}
