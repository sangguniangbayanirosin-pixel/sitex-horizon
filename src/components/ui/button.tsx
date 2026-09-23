import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "liquid-glass relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "liquid-glass-accent text-accent-fg",
        secondary: "liquid-glass-clear text-fg",
        ghost: "liquid-glass-ghost text-muted",
        danger: "liquid-glass-danger text-accent-fg",
      },
      size: {
        default: "h-11 rounded-md px-4 text-sm",
        sm: "h-10 min-h-10 rounded-sm px-3 text-sm",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "size-11 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function spawnRipple(target: HTMLElement, clientX: number, clientY: number) {
  const rect = target.getBoundingClientRect();
  const span = document.createElement("span");
  const size = Math.max(rect.width, rect.height) * 1.8;
  span.className = "liquid-ripple";
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  span.style.left = `${clientX - rect.left - size / 2}px`;
  span.style.top = `${clientY - rect.top - size / 2}px`;
  target.appendChild(span);
  window.setTimeout(() => span.remove(), 650);
}

export function Button({
  className,
  variant,
  size,
  asChild,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    spawnRipple(e.currentTarget, e.clientX, e.clientY);
    onClick?.(e);
  };
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
      onClick={handleClick}
    />
  );
}
