"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:font-sans group-[.toaster]:rounded-xl group-[.toaster]:shadow-lg group-[.toaster]:border-0 group-[.toaster]:px-4 group-[.toaster]:py-3.5",
          title: "group-[.toaster]:font-semibold group-[.toaster]:text-sm",
          description: "group-[.toaster]:text-xs",
          success:
            "group-[.toaster]:!bg-blue-600 group-[.toaster]:!text-white group-[.toaster]:!border-blue-700 [&_[data-icon]>svg]:!text-white",
          error:
            "group-[.toaster]:!bg-red-500 group-[.toaster]:!text-white group-[.toaster]:!border-red-600 [&_[data-icon]>svg]:!text-white",
          info:
            "group-[.toaster]:!bg-blue-500 group-[.toaster]:!text-white group-[.toaster]:!border-blue-600 [&_[data-icon]>svg]:!text-white",
          warning:
            "group-[.toaster]:!bg-amber-500 group-[.toaster]:!text-white group-[.toaster]:!border-amber-600 [&_[data-icon]>svg]:!text-white",
          actionButton:
            "group-[.toaster]:!bg-white group-[.toaster]:!text-blue-700 group-[.toaster]:!font-bold group-[.toaster]:!rounded-lg group-[.toaster]:!text-xs",
          cancelButton:
            "group-[.toaster]:!bg-white/20 group-[.toaster]:!text-white group-[.toaster]:!font-medium group-[.toaster]:!rounded-lg group-[.toaster]:!text-xs",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
