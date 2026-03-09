export function cn(...inputs) {
    // Basic shim for cn util if tailwind-merge/clsx are not used
    return inputs.filter(Boolean).join(" ");
}
