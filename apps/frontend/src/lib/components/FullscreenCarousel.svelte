<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import 'iconify-icon';

	interface GalleryItem {
		id: string;
		title: string;
		description: string;
		date: string;
		link?: string | null;
		media: {
			url: string;
		};
	}

	let {
		items = [],
		onClose = () => {},
		initialIndex = 0
	}: { items: GalleryItem[]; onClose?: () => void; initialIndex?: number } = $props();

	let currentIndex = $state(0);
	let touchStartX = $state(0);
	let touchEndX = $state(0);
	let isTransitioning = $state(false);

	const currentItem = $derived(items[currentIndex]);

	$effect(() => {
		if (items.length === 0) {
			currentIndex = 0;
			return;
		}

		currentIndex = Math.min(Math.max(initialIndex, 0), items.length - 1);
	});

	function nextSlide() {
		if (isTransitioning) return;
		isTransitioning = true;
		currentIndex = (currentIndex + 1) % items.length;
		setTimeout(() => (isTransitioning = false), 500);
	}

	function prevSlide() {
		if (isTransitioning) return;
		isTransitioning = true;
		currentIndex = (currentIndex - 1 + items.length) % items.length;
		setTimeout(() => (isTransitioning = false), 500);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
		if (e.key === 'ArrowRight') nextSlide();
		if (e.key === 'ArrowLeft') prevSlide();
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}

	function handleSwipe() {
		const swipeThreshold = 50;
		if (touchStartX - touchEndX > swipeThreshold) {
			nextSlide();
		}
		if (touchEndX - touchStartX > swipeThreshold) {
			prevSlide();
		}
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		document.body.style.overflow = '';
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div
	class="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
>
	<button
		onclick={onClose}
		class="absolute top-6 right-6 md:top-8 md:right-8 z-50 text-white/70 hover:text-white transition-colors group"
		aria-label="Close carousel"
	>
		<iconify-icon
			icon="solar:close-circle-bold"
			width="40"
			class="group-hover:scale-110 transition-transform"
		></iconify-icon>
	</button>

	<button
		onclick={prevSlide}
		disabled={isTransitioning}
		class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white transition-all hover:scale-110 disabled:opacity-30"
		aria-label="Previous image"
	>
		<iconify-icon icon="solar:alt-arrow-left-bold" width="48"></iconify-icon>
	</button>

	<button
		onclick={nextSlide}
		disabled={isTransitioning}
		class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white transition-all hover:scale-110 disabled:opacity-30"
		aria-label="Next image"
	>
		<iconify-icon icon="solar:alt-arrow-right-bold" width="48"></iconify-icon>
	</button>

	{#if currentItem}
		<div class="w-full h-full flex items-center justify-center px-4 md:px-20">
			<div class="w-full h-full flex flex-col md:flex-row items-center gap-8 md:gap-12 py-20">
				<div class="flex-1 h-full flex items-center justify-center max-w-4xl">
					<img
						src={currentItem.media.url}
						alt={currentItem.title}
						class="max-h-full max-w-full object-contain drop-shadow-2xl transition-opacity duration-500"
						class:opacity-0={isTransitioning}
					/>
				</div>

				<div
					class="w-full md:w-96 text-white space-y-6 transition-opacity duration-500"
					class:opacity-0={isTransitioning}
				>
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h2 class="text-3xl md:text-4xl font-light tracking-wide">{currentItem.title}</h2>
							<span class="text-white/50 text-sm font-light"
								>{currentIndex + 1} / {items.length}</span
							>
						</div>
						<p class="text-white/70 uppercase tracking-widest text-xs">{currentItem.date}</p>
					</div>

					<p class="text-white/80 font-light leading-relaxed text-sm md:text-base">
						{currentItem.description}
					</p>

					{#if currentItem.link}
						<a
							href={currentItem.link}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-white/70 hover:text-white transition-colors border-b border-white/30 hover:border-white pb-1"
						>
							En savoir plus
							<iconify-icon icon="solar:arrow-right-line-duotone" width="16"></iconify-icon>
						</a>
					{/if}

					<div class="flex gap-2 pt-4">
						{#each items as _, idx}
							<button
								onclick={() => {
									if (!isTransitioning) {
										isTransitioning = true;
										currentIndex = idx;
										setTimeout(() => (isTransitioning = false), 500);
									}
								}}
								class="h-1 flex-1 transition-all {idx === currentIndex
									? 'bg-white'
									: 'bg-white/30 hover:bg-white/50'}"
								aria-label={`Go to slide ${idx + 1}`}
							></button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
