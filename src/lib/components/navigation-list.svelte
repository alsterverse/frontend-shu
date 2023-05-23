<script lang="ts">
	import { overflowRatio } from '$lib/actions/overflow-ratio';
	import { direction } from '$lib/actions/direction';

	export let tag: 'ul' | 'ol' = 'ul';
</script>

<div class="overflow-shadow">
	<svelte:element this={tag} use:overflowRatio use:direction>
		<slot />
	</svelte:element>
</div>

<style>
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
