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

export function create_node(absolute_path: string): NavigationNode {
	const relative_path = absolute_path.replace(DIRECTORY, '');
	const file_name = relative_path.split('/').pop() ?? '';
	const name = file_name.replace('.md', '');
	const title = decode_name(name);
	const directories = relative_path
		.split('/')
		.slice(0, -1)
		.filter((dir) => dir && dir !== '');
	const slug =
		name === WIKI_HOME
			? ''
			: `${directories.map(to_slug).join('/')}${directories.length ? '/' : ''}${to_slug(name)}`;
	return { slug, title, name };
}

function walk_and_add_nodes(nodes: NavigationNode[], dir_path: string, parent_slug?: string) {
	const dir_files = readdirSync(dir_path);
	const parent = nodes.find((n) => n.slug === parent_slug);
	dir_files.forEach((file) => {
		const absolute_path = resolve(dir_path, file);
		const node = create_node(absolute_path);
		const is_dir = is_directory(absolute_path);

		if (!is_dir && !file.endsWith('.md')) return;

		nodes.push(node);

		if (parent) {
			if (!parent.children) parent.children = [];
			parent.children.push(node.slug);
		}

		if (is_dir) {
			walk_and_add_nodes(nodes, absolute_path, node.slug);
		}
	});
}

export function get_nodes() {
	const nodes: NavigationNode[] = [];
	walk_and_add_nodes(nodes, DIRECTORY);
	nodes.sort((a, b) => {
		if (a.name === WIKI_HOME) return -1;
		if (b.name === WIKI_HOME) return 1;
		return 0;
	});
	return nodes;
}

export const get_file = (path: string) => readFileSync(path, 'utf-8');
export const get_meta = (path: string) => readFileSync(`${path}.meta`, 'utf-8');

export const to_slug = (value?: string | null) =>
	slugify(value ?? 'unknown', { strict: true, lower: true });

export const get_file_edit_url = (name: string) =>
	`https://github.com/${GITHUB_PROJECT}/wiki/${encodeURIComponent(name)}/_edit`;

export const raw_url = (name: string) =>
	`https://raw.githubusercontent.com/wiki/${GITHUB_PROJECT}/${name}.md`;
