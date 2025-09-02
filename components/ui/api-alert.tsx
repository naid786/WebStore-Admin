"use cllient";

import { Copy, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge, badgeVariants } from "./badge";
import { Button } from "./button";
import toast from "react-hot-toast";

interface ApiAlertProps {
    title: string;
    description: string;
    variant: "public" | "admin";
}

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline";
};

const textMap: Record<ApiAlertProps["variant"], string> = {
    public: "Public",
    admin: "Admin"
};

const BadgeProps: Record<ApiAlertProps["variant"], BadgeProps["variant"]> = {
    public: "secondary",
    admin: "destructive"
};

export const ApiAlert: React.FC<ApiAlertProps> = ({
    title,
    description,
    variant = "public",
}) => {
    const onCopy=()=>{
        navigator.clipboard.writeText(description)
        toast.success("API Route copied to the clipboard.")
    }
    return (
        <Alert>
            
            <AlertTitle className="flex items-center gap-x-2">
                <Server className="h-4 w-4" />
                {title}
                <Badge variant={BadgeProps[variant]}>
                    {textMap[variant]}
                </Badge>
            </AlertTitle>
            <AlertDescription className="mt-4 flex items-center justify-between">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2] font-mono text-sm font-semibold">
                    {description}
                </code>
                <Button variant='outline' size="icon" onClick={onCopy}>
                    <Copy className="h-4 w-4 " />
                </Button>
            </AlertDescription>
        </Alert>
    )
}
