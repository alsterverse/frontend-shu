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
		class="indicator-{direction}"
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

	ul :global(a),
	ol :global(a),
	ul :global(button) {
		padding-left: var(--indent);
		padding-top: 1rem;
		padding-bottom: 1rem;
		padding-right: 1.5rem;
	}

	ul :global(a),
	ul :global(button) {
		font-weight: 500;
		width: 100%;
	}

	ol :global(a) {
		font-weight: 400;
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
