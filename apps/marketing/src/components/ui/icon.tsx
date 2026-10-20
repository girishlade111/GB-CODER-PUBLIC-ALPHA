// React twin of `ui/Icon.astro`. Both read the same geometry registry, so an
// icon never changes weight or shape when it crosses from an Astro page into a
// hydrated island.
import { ICON_PATHS, type IconName } from "./icons";

export function Icon({
  name,
  size = 18,
  label,
  className,
  strokeWidth = 1.75,
}: {
  name: IconName;
  size?: number;
  label?: string;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  );
}
