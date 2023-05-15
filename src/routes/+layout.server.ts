import type { LayoutServerLoad } from './$types';
import { get_nodes } from '$lib/server/data';

export const load = (async () => {
	return {
		nodes: get_nodes()
	};
}) satisfies LayoutServerLoad;
