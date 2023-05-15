<script lang="ts">
	import { overflow_ratio } from '$lib/actions/overflow_ratio';

	export let tag: 'ul' | 'ol' = 'ul';
	export let direction: 'up' | 'down';
	let start_ratio = 0;
	let end_ratio = 0;

	function handle_ratios(event: CustomEvent<number>) {
		if (event.type === 'startoverflowratio') {
			start_ratio = event.detail;
		} else if (event.type === 'endoverflowratio') {
			end_ratio = event.detail;
		}
	}
</script>

<div style="--start-ratio: {start_ratio}; --end-ratio: {end_ratio}">
	<svelte:element
		this={tag}
		class:up={direction === 'up'}
		use:overflow_ratio
		on:startoverflowratio={handle_ratios}
		on:endoverflowratio={handle_ratios}
	>
		<slot />
	</svelte:element>
</div>

<style>
	div {
		position: relative;
		overflow: hidden;
	}

	div::before,
	div::after {
		position: absolute;
		content: '';
		display: block;
		height: 1.5rem;
		left: 0;
		right: 0;
		z-index: 10;
	}

	div::before {
		top: 0;
		background: linear-gradient(to bottom, var(--theme-bg) 0%, transparent 100%);
		transform: translateY(calc((1 - var(--start-ratio)) * -100%));
	}

	div::after {
		bottom: 0;
		background: linear-gradient(to top, var(--theme-bg) 0%, transparent 100%);
		transform: translateY(calc((1 - var(--end-ratio)) * 100%));
	}

	ul,
	ol {
		--origin-in: top;
		--origin-out: bottom;
		--duration: 200ms;
		--delay: 200ms;
		--indent: 1.5rem;

		display: flex;
		flex-direction: column;
		padding: 0;
		margin: 0;
		list-style: none;
		font-size: 1rem;
		overflow: auto;
		max-height: 100vh;
	}

	ol {
		box-shadow: inset 4px 0px var(--theme-panel);
	}

	ul.up,
	ol.up {
		--origin-in: bottom;
		--origin-out: top;
	}

	ul :global(a),
	ol :global(a),
	ul :global(button) {
		position: relative;
		display: inline-block;
		padding-left: var(--indent);
		padding-top: 1rem;
		padding-bottom: 1rem;
		padding-right: 1.5rem;
		color: var(--theme-fg);
		text-decoration: none;
	}

	ul :global(a),
	ul :global(button) {
		font-weight: 500;
		width: 100%;
	}

	ol :global(a) {
		font-weight: 400;
	}

	ul :global(a[aria-current='page']),
	ol :global(a[aria-current='location']) {
		background: linear-gradient(
			270deg,
			var(--theme-nav-gradient-start) -0.09%,
			var(--theme-nav-gradient-end) 100%
		);
	}

	ul :global(a::after),
	ol :global(a::after),
	ul :global(button::after) {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		content: '';
		width: 0.25rem;
		background-color: var(--theme-accent);
		background-position: bottom;
		transform: scale(1, 0);
		transform-origin: var(--origin-out);
		transition-property: transform, background-color;
		transition-duration: var(--duration), var(--duration);
		transition-delay: calc(var(--delay) * 0.5), var(--delay);
		transition-timing-function: ease-out, ease-out;
	}

	ul :global(a[aria-current='page']::after),
	ol :global(a[aria-current='location']::after) {
		background-color: var(--theme-accent);
		transform: scale(1, 1);
		transition-delay: 0ms, var(--delay);
		transform-origin: var(--origin-in);
	}

	ul :global(a[aria-current='page']),
	ol :global(a[aria-current='location']) {
		color: var(--theme-body);
	}

	ul :global(a[aria-current='page']):hover,
	ol :global(a[aria-current='location']):hover {
		animation: none;
		-webkit-text-fill-color: unset;
	}

	@supports selector(:has(*)) {
		ul :global(button[aria-expanded='false']:has(+ ul [aria-current='page'])) {
			background: linear-gradient(
				270deg,
				var(--theme-nav-gradient-start) -0.09%,
				var(--theme-nav-gradient-end) 100%
			);
		}

		ul :global(button[aria-expanded='false']:has(+ ul [aria-current='page'])::after) {
			background-color: var(--theme-accent);
			transform: scale(1, 1);
			transition-delay: 0ms, var(--delay);
			transform-origin: var(--origin-in);
		}

		ul :global(button[aria-expanded='false']:has(+ ul [aria-current='page'])):hover {
			animation: none;
			-webkit-text-fill-color: unset;
		}
	}

	@media (min-width: 55em) {
		ul,
		ol {
			font-size: 0.875rem;
		}

		ul :global(a),
		ol :global(a),
		ul :global(button) {
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
		}
	}
</style>
