export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function clamp(number: number, min: number, max: number) {
	return Math.max(min, Math.min(number, max));
}
