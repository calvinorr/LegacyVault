// Bridge module to re-export the TSX implementation.
// This avoids accidental .ts file containing JSX which causes build errors.
// Keep this thin so the real implementation lives in useCategories.tsx
export * from "./useCategories.tsx";