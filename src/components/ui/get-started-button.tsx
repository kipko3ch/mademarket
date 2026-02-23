import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
    text?: string;
}

export function GetStartedButton({ text = "Get Started", className, ...props }: AnimatedButtonProps) {
    return (
        <Button className={cn("group relative overflow-hidden", className)} size="lg" {...props}>
            <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0 font-sans font-bold text-base">
                {text}
            </span>
            <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-black/10 dark:bg-white/10 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-inherit group-hover:bg-primary group-hover:text-primary-foreground">
                <ChevronRight size={20} strokeWidth={2.5} aria-hidden="true" />
            </i>
        </Button>
    );
}
