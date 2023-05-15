<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import type { NavigationNode } from '$lib/types';

	export let node: NavigationNode;
	export let nodes: NavigationNode[];

	let expanded = !browser;

	const toggle = () => {
		expanded = !expanded;
	};

	$: lvl = node.slug.split('/').length + 1;

	const check_if_expanded = (current_node?: NavigationNode, active_slug?: string): boolean => {
		if (!active_slug || !current_node) return false;

		if (current_node.children) {
			return current_node.children.some((child_slug) =>
				check_if_expanded(
					nodes.find((node) => node.slug === child_slug),
					active_slug
				)
			);
		}

		return current_node.slug === active_slug;
	};

	afterNavigate(({ to }) => {
		if (node.children) {
			const has_active_child = check_if_expanded(node, to?.params?.slug);
			if (has_active_child) expanded = true;
		}
	});
</script>

<li style="--lvl: {lvl}">
	{#if node.children}
		<button
			class="link"
			on:click={toggle}
			aria-expanded={expanded}
			aria-controls={node.slug.replaceAll('/', '-')}>{node.title}</button
		>
		<ul id={node.slug.replaceAll('/', '-')} aria-hidden={expanded ? undefined : true}>
			{#each node.children as child_slug}
				{@const child = nodes.find((node) => node.slug === child_slug)}
				{#if child}
					<svelte:self node={child} {nodes} />
				{/if}
			{/each}
		</ul>
	{:else}
		<a
			href={node.slug === '' ? '/' : `/articles/${node.slug}`}
			aria-current={(!$page.params.slug && node.slug === '') || $page.params.slug === node.slug
				? 'page'
				: undefined}>{node.title}</a
		>
	{/if}
</li>

<style>
	ul {
		--indent: calc(var(--lvl) * 1.25rem);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	[aria-hidden='true'] {
		display: none;
	}

	button[aria-expanded='true'] {
		padding-bottom: 0.5rem;
	}

	button::before {
		content: '';
		display: inline-block;
		height: 0.5rem;
		width: 0.5rem;
		background: linear-gradient(
			45deg,
			transparent 0%,
			transparent 49.999%,
			var(--theme-fg) 50%,
			var(--theme-fg) 100%
		);
		margin-right: 0.75rem;
		background-repeat: no-repeat;
		transform: rotate(45deg) translateX(-25%);
	}

	button[aria-expanded='true']::before {
		transform: rotate(135deg) translateX(-50%);
	}

	button,
	a {
		padding-left: var(--indent);
	}
</style>
