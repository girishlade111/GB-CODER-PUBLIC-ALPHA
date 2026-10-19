// Adapted from shadcn/ui (MIT): variants use the marketing site's shared CSS tokens.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

export const buttonVariants = cva("ui-button", {
  variants: {
    variant: {
      default: "",
      outline: "ui-button-outline",
      ghost: "ui-button-ghost",
    },
  },
  defaultVariants: { variant: "default" },
});
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;
export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(buttonVariants({ variant }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
