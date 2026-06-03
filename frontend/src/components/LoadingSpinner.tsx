interface Props {
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };

export default function LoadingSpinner({ size = "md" }: Props) {
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-orange-500/30 border-t-purple-400`}
      role="status"
      aria-label="Loading"
    />
  );
}
