import {
	decode_name,
	get_file,
	get_file_edit_url,
	get_name_from_path,
	get_all_markdown_paths,
	to_slug,
	get_meta
} from '$lib/server/data';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { sections } from '$lib/server/markdown';
import { format } from 'date-fns';

async function get_page(path: string) {
	const name = get_name_from_path(path);
	if (!name) throw error(503, `Could not extract name from path: ${path}`);
	let meta = `unknown@${new Date().toISOString()}`;
	try {
		meta = get_meta(path);
	} catch {
		console.error('Missing meta file for:', path);
	}
	const [author, modified] = meta.split('@');

	return {
		title: decode_name(name),
		author,
		modified: { display: format(new Date(modified), 'MMM d yyyy'), value: modified },
		sections: sections(get_file(path)),
		edit: get_file_edit_url(name)
	};
}

export const load = (async ({ params }) => {
	console.log(params.slug);
	for (const path of get_all_markdown_paths()) {
		if (to_slug(get_name_from_path(path)) === params.slug) {
			return {
				page: await get_page(path)
			};
		}
	}

	throw error(404);
}) satisfies PageServerLoad;
