<script lang="ts">
	import { page } from '$app/stores';
	import type { NavigationNode } from '$lib/types';

	export let node: NavigationNode;
</script>

<li>
	{#if node.children}
		<button>{node.title}</button>
		<ul>
			{#each node.children as child}
				{#if child}
					<svelte:self node={child} />
				{/if}
			{/each}
		</ul>
	{:else if node.url}
		<a
			href={node.url}
			aria-current={(!$page.params.slug && node.slug === '') || $page.params.slug === node.slug
				? 'page'
				: undefined}>{node.title}</a
		>
	{/if}
</li>
