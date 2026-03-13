<script lang="ts">
	import { trpc } from '$lib/trpc';
	import { onMount } from 'svelte';
	import 'iconify-icon';

	let loading = $state(true);
	let galleryItems = $state<any[]>([]);

	onMount(async () => {
		try {
			galleryItems = await trpc.gallery.listAll.query();
		} catch (err) {
			console.error('Failed to load gallery items:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="p-8 max-w-[1400px] mx-auto">
	<div class="mb-8">
		<h1 class="text-3xl font-black mb-2">Statistics</h1>
		<p class="text-slate-500">Portfolio overview and analytics</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="bg-white rounded-2xl border-2 border-slate-200 p-8">
				<div class="flex items-center gap-4 mb-4">
					<div class="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white">
						<iconify-icon icon="solar:gallery-bold" width="24"></iconify-icon>
					</div>
					<div>
						<p class="text-sm text-slate-500 font-bold">Gallery Items</p>
						<p class="text-3xl font-black">{galleryItems.length}/4</p>
					</div>
				</div>
				<div class="mt-4 pt-4 border-t border-slate-100">
					<p class="text-xs text-slate-400">
						{4 - galleryItems.length} slots remaining
					</p>
				</div>
			</div>

			<div class="bg-white rounded-2xl border-2 border-slate-200 p-8">
				<div class="flex items-center gap-4 mb-4">
					<div class="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white">
						<iconify-icon icon="solar:chart-bold" width="24"></iconify-icon>
					</div>
					<div>
						<p class="text-sm text-slate-500 font-bold">Portfolio Status</p>
						<p class="text-xl font-black">
							{galleryItems.length === 0 ? 'Empty' : galleryItems.length === 4 ? 'Full' : 'Active'}
						</p>
					</div>
				</div>
				<div class="mt-4 pt-4 border-t border-slate-100">
					<p class="text-xs text-slate-400">
						{galleryItems.length === 4
							? 'Gallery is at maximum capacity'
							: 'Add more items to showcase your work'}
					</p>
				</div>
			</div>

			<div class="bg-white rounded-2xl border-2 border-slate-200 p-8">
				<div class="flex items-center gap-4 mb-4">
					<div class="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white">
						<iconify-icon icon="solar:palette-bold" width="24"></iconify-icon>
					</div>
					<div>
						<p class="text-sm text-slate-500 font-bold">Theme</p>
						<p class="text-xl font-black">Minimalist</p>
					</div>
				</div>
				<div class="mt-4 pt-4 border-t border-slate-100">
					<p class="text-xs text-slate-400">Black & white design system</p>
				</div>
			</div>
		</div>

		{#if galleryItems.length > 0}
			<div class="mt-8">
				<h2 class="text-xl font-black mb-4">Gallery Overview</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each galleryItems as item}
						<div class="bg-white rounded-2xl border-2 border-slate-200 p-4 flex gap-4">
							<div class="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
								<img
									src={item.media.url}
									alt={item.title}
									class="w-full h-full object-cover"
								/>
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="font-black text-sm truncate">{item.title}</h3>
								<p class="text-xs text-slate-400 truncate">{item.date}</p>
								<p class="text-xs text-slate-500 mt-2 line-clamp-2">{item.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
