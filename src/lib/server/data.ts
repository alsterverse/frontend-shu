import { glob } from 'glob';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import slugify from 'slugify';
import { DATA_DIR, GITHUB_PROJECT, WIKI_HOME } from '$env/static/private';
import type { NavigationNode } from '$lib/types';

export const DIRECTORY = resolve(DATA_DIR);

export const get_name_from_path = (path: string) => path.split('/').pop()?.replace('.md', '');

export const decode_name = (slug: string) => slug.split('-').join(' ');

export const get_all_markdown_paths = () =>
	glob.sync(`${DIRECTORY}**/**/*.md`, { ignore: '.git/**' });

function is_directory(path: string) {
	try {
		const stat = lstatSync(path);
		return stat.isDirectory();
	} catch (error) {
		return false;
	}
}

function create_node(path: string): NavigationNode {
	const file_name = path.split('/').pop() ?? '';
	const name = file_name.replace('.md', '');
	const slug = to_slug(name);
	const title = decode_name(name);
	const directories = path.split('/').slice(0, -1);
	const parent = directories.at(-1) ?? '';
	let url;
	if (file_name.endsWith('.md')) {
		url = name === WIKI_HOME ? '' : `/articles${directories.map(to_slug).join('/')}/${slug}`;
	}
	return { slug, title, url, parent, path: path };
}

function walk_and_create_nodes(dir_path: string) {
	const dir_files = readdirSync(dir_path);
	const n = dir_files.reduce<NavigationNode[]>((nodes, file) => {
		const absolute_path = resolve(dir_path, file);
		const relative_path = absolute_path.replace(DIRECTORY, '');
		const node = create_node(relative_path);
		const is_dir = is_directory(absolute_path);

		if (!is_dir && !file.endsWith('.md')) return nodes;

		if (is_dir) {
			node.children = walk_and_create_nodes(absolute_path);
		}

		nodes.push(node);
		return nodes;
	}, []);
	return n;
}

export function get_nodes() {
	return walk_and_create_nodes(DIRECTORY);
}

export const get_file = (path: string) => readFileSync(path, 'utf-8');
export const get_meta = (path: string) => readFileSync(`${path}.meta`, 'utf-8');

export const to_slug = (value?: string | null) =>
	slugify(value ?? 'unknown', { strict: true, lower: true });

export const get_file_edit_url = (name: string) =>
	`https://github.com/${GITHUB_PROJECT}/wiki/${encodeURIComponent(name)}/_edit`;

export const raw_url = (name: string) =>
	`https://raw.githubusercontent.com/wiki/${GITHUB_PROJECT}/${name}.md`;
