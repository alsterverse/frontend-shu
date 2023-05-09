<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { active_section } from '$lib/actions/active-section';
	import NavigationList from '$lib/components/navigation-list.svelte';
	import '$lib/styles/code.css';
	import { sleep } from '$lib/utils';

	export let data;

	let active: string | null = null;
	let direction: 'up' | 'down' = 'down';
	let anchored = false;

	const on_active = (
		event: CustomEvent<{ active: string; direction: 'up' | 'down'; anchored: boolean }>
	) => {
		active = event.detail.active;
		direction = event.detail.direction;
		anchored = event.detail.anchored;
	};

	afterNavigate(async (navigation) => {
		const deeplink = navigation.to?.url.hash.split('#')[1];
		if (deeplink) {
			await sleep(100);
			active = deeplink;
			direction = 'down';
			anchored = true;
		}
	});
</script>

<svelte:head>
	<title>{data.page.title} | Alster Docs</title>
</svelte:head>

{#key $page.params.slug}
	<article use:active_section on:activesection={on_active}>
		<div class="content">
			<header>
				<h1 id="top"><a href="#top">{data.page.title}</a></h1>
				<div>
					<ul>
						<li>
							Edited <time datetime={data.page.modified.value}>{data.page.modified.display}</time>
						</li>
						<li>{data.page.author}</li>
					</ul>
					<a class="edit" href={data.page.edit}>Edit page</a>
				</div>
			</header>
			{#each data.page.sections as section}
				<section id={section.slug} class:active={anchored && section.slug === active}>
					{#if section.title && section.slug}
						<h2><a href={`#${section.slug}`}>{section.title}</a></h2>
					{/if}
					{@html section.content}
				</section>
			{/each}
		</div>
		{#if data.page.sections.length > 1}
			<aside>
				<nav>
					<h2>In this article</h2>
					<NavigationList {direction} tag="ol">
						{#each data.page.sections as section}
							{#if section.title && section.slug}
								<li>
									<a
										href={`#${section.slug}`}
										aria-current={active === section.slug ? 'location' : undefined}
										>{section.title}</a
									>
								</li>
							{/if}
						{/each}
					</NavigationList>
				</nav>
			</aside>
		{/if}
	</article>
{/key}

<style>
	header {
		display: flex;
		flex-direction: column;
		container-type: inline-size;
	}

	section.active {
		--outline-color: hsla(0, 0%, 42%, 0.06);
		--outline-offset: 0rem;
		--outline-width: 1rem;
		outline-style: solid;
		outline-width: var(--outline-width);
		outline-offset: var(--outline-offset);
		outline-color: var(--outline-color);
	}

	:global(.dark) section.active {
		--outline-color: hsla(0, 0%, 42%, 0.2);
	}

	@keyframes section-focus-animation {
		0% {
			outline-width: var(--outline-width);
		}

		100% {
			outline-width: 0rem;
		}
	}

	header div {
		margin-top: 1.5rem;
		padding-top: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: start;
		border-top: 4px solid var(--theme-stroke);
		color: var(--theme-body);
	}

	header ul {
		display: flex;
		align-items: baseline;
		padding: 0;
		margin: 0;
		list-style: none;
		font-size: 0.875rem;
		flex-direction: column;
	}

	header li:not(:first-child) {
		font-size: 0.75rem;
	}

	@container (min-width: 32em) {
		header ul {
			flex-direction: row;
		}

		header li:not(:first-child) {
			font-size: 0.875rem;
		}

		header li:not(:first-child)::before {
			content: '•';
			margin: 0 0.5ch;
		}
	}

	.edit {
		display: flex;
		gap: 0.5rem;
		color: var(--theme-fg);
		text-decoration: none;
		font-size: 0.75rem;
	}

	.edit::before {
		--icon-dark: url(/icons/edit_inverted.svg);
		--icon-light: url(/icons/edit.svg);
		--icon: var(--icon-light);

		content: '';
		display: inline-block;
		width: 1rem;
		height: 1rem;
		background-image: var(--icon);
	}

	aside {
		display: none;
	}

	nav {
		position: sticky;
		top: calc(var(--header-height) + var(--top-gutter));
	}

	nav > h2 {
		font-size: 1rem;
		margin-bottom: 1.5rem;
	}

	@media (min-width: 55em) {
		header div {
			margin-top: 2rem;
		}

		section.active {
			--outline-width: 1rem;
			--outline-offset: 1rem;

			animation: section-focus-animation 300ms ease-in forwards;
			animation-delay: 220ms;
			animation-iteration-count: 1;
		}

		h1,
		h2 {
			--icon-link-dark: url(/icons/link_theme_dark.svg);
			--icon-link-light: url(/icons/link_theme_light.svg);
			--icon-link: var(--icon-link-light);
			--icon-link-posiiton-offset-x: -1.2rem;
			position: relative;
		}

		h1 a:hover::before,
		h2 a:hover::before {
			content: '';
			position: absolute;
			top: 0.3rem;
			left: var(--icon-link-posiiton-offset-x);

			width: 1rem;
			height: 1rem;
			background-image: var(--icon-link);
		}

		:global(.dark) h1,
		:global(.dark) h2 {
			--icon-link: var(--icon-link-dark);
		}

		:global(.light) h1,
		:global(.light) h2 {
			--icon-link: var(--icon-link-light);
		}
	}

	@media (min-width: 73rem) {
		aside {
			display: block;
		}

		article {
			position: relative;
			display: grid;
			gap: 0 var(--gap-width);
			grid-template-columns: auto var(--aside-width);
		}

		h1,
		h2 {
			--icon-link-posiiton-offset-x: -1.5rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		.edit::before {
			--icon: var(--icon-dark);
		}

		h1,
		h2 {
			--icon-link: var(--icon-link-dark);
		}
	}

	:global(.dark) .edit::before {
		--icon: var(--icon-dark);
	}

	:global(.light) .edit::before {
		--icon: var(--icon-light);
	}
</style>
