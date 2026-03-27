<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc';
	import FullscreenCarousel from '$lib/components/FullscreenCarousel.svelte';
	import gsap from 'gsap';
	import 'iconify-icon';

	// --- DOM REFS ---
	let canvas: HTMLCanvasElement;
	let containers: HTMLElement[] = [];

	// --- STATE ---
	let ctx: CanvasRenderingContext2D | null = null;
	let overlayImage: HTMLImageElement | null = null;
	let activeColor: string | null = null;
	let video: HTMLVideoElement;

	// --- DATA ---
	const hoverInfos = [
		{
			title: 'VIDEOS',
			description: "See all the video projects I've done",
			projects: 12,
			Year: '2024 - 2025',
		},
		{
			title: 'GALLERY',
			description: 'Take a look at my photos',
			projects: 12,
			Year: '2024 - 2025',
		},
		{
			title: 'SCENOGRAPHY',
			description: "See all the scenography projects I've done",
			projects: 12,
			Year: '2024 - 2025',
		},
		{
			title: 'SANDBOX',
			description: "See all the sandbox projects I've done",
			projects: 12,
			Year: '2024 - 2025',
		},
	];

	const colorMap: Record<string, number> = {
		'#00FF00': 0,
		'#01FF00': 0,
		'#0000FF': 1,
		'#FF0000': 2,
		'#FFFFFF': 3,
	};

	let email = '',
		firstName = '',
		lastName = '',
		loading = false,
		message = '',
		galleryItems: any[] = [],
		aboutContent = '',
		dataLoading = true,
		isAnimating = false,
		showCarousel = false,
		carouselStartIndex = 0,
		socialLinks = { instagram: '', facebook: '', email: '' };

	// CANVAS & IMAGE LOGIC //

	const preloadImage = (src: string): Promise<HTMLImageElement> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = 'Anonymous';
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error(`Failed to load image at ${src}`));
			img.src = src;
		});
	};

	function rgbToHex(r: number, g: number, b: number) {
		return (
			'#' +
			[r, g, b]
				.map((v) => v.toString(16).padStart(2, '0'))
				.join('')
				.toUpperCase()
		);
	}

	function drawCanvas() {
		if (!canvas || !overlayImage || !video) return;
		ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return;

		const rect = video.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;
		canvas.style.left = `${rect.left}px`;
		canvas.style.top = `${rect.top}px`;

		ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
	}

	function handleResize() {
		drawCanvas();
	}

	// ONMOUNT

	onMount(() => {
		preloadImage('/backgroundOverlay.png')
			.then((img) => {
				overlayImage = img;
				drawCanvas();
			})
			.catch((err) => console.error(err));

		gsap.set('.animatedText', { y: '100%' });

		Promise.all([trpc.gallery.list.query(), trpc.about.get.query(), trpc.social.get.query()])
			.then(([gallery, about, social]) => {
				galleryItems = gallery || [];
				aboutContent = about?.content || '';
				socialLinks = social || { instagram: null, facebook: null, email: null };
			})
			.finally(() => {
				dataLoading = false;
			});
	});

	// ANIMTAION LOGIC //

	const getTargets = (index: number) => {
		const container = containers[index];
		if (!container) return null;
		const targets = Array.from(container.querySelectorAll('.animatedText'));
		return targets;
	};

	function triggerAnimation(prevIndex: number | null, newIndex: number | null) {
		const tl = gsap.timeline();

		if (prevIndex !== null && prevIndex !== undefined) {
			const targets = getTargets(prevIndex);
			if (!targets) return;
			tl.to(targets, {
				y: '-100%',
				stagger: 0.1,
				duration: 0.5,
				ease: 'power3.out',
			});
			tl.set(targets, {
				y: '100%',
			});
		}

		if (newIndex !== null && newIndex !== undefined) {
			const targets = getTargets(newIndex);
			if (!targets) return;

			tl.set(targets, {
				y: '100%',
			});
			tl.to(targets, {
				y: '0',
				stagger: 0.1,
				duration: 0.5,
				ease: 'power3.out',
			});
		}
	}

	function handleHover(event: MouseEvent) {
		if (!canvas || !ctx) return;
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
		const y = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));

		try {
			const pixel = ctx.getImageData(x, y, 1, 1).data;
			let newHex: string | null = null;

			if (pixel[3] !== 0) {
				const tmp = rgbToHex(pixel[0], pixel[1], pixel[2]);
				newHex = tmp === '01FF00' ? '00FF00' : tmp;
			}

			if (activeColor === newHex) return;

			const prevIndex = activeColor !== null ? (colorMap[activeColor] ?? null) : null;
			const newIndex = newHex !== null ? (colorMap[newHex] ?? null) : null;

			triggerAnimation(prevIndex, newIndex);
			activeColor = newHex;
		} catch (e) {}
	}
</script>

<svelte:window onresize={handleResize} />

<div
	class="min-h-screen bg-[#0e0e0e] text-white font-['Helvena'] selection:bg-white selection:text-black"
>
	<nav class="fixed top-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-[60]">
		<div class="w-full opacity-0">CONTACT</div>
		<div class="flex items-center gap-8 text-lg capitalize">
			<a href="/bundle?category=gallery" class="hover:opacity-50 transition">GALLERY</a>
			<a href="/bundle?category=scenography" class="hover:opacity-50 transition">SCENOGRAPHY</a>
			<a href="/bundle?category=video" class="hover:opacity-50 transition">VIDEOS</a>
			<a href="/bundle?category=none" class="hover:opacity-50 transition">OTHER</a>
		</div>
		<div class="w-full flex items-center justify-end gap-24 uppercase">CONTACT</div>
	</nav>

	<section class="h-screen flex items-center justify-center relative overflow-hidden bg-black">
		<video
			bind:this={video}
			onloadedmetadata={drawCanvas}
			src="/4K_facade_clair.mp4"
			autoplay
			loop
			muted
			playsinline
			class="absolute inset-0 h-full w-full object-cover z-0"
		></video>
		<canvas
			bind:this={canvas}
			onmousemove={handleHover}
			class="absolute inset-0 z-70 opacity-20 cursor-crosshair pointer-events-auto"
		></canvas>

		{#each hoverInfos as info, index}
			<div class="absolute inset-0 z-55 pointer-events-none" bind:this={containers[index]}>
				<div class="absolute bottom-12 left-12">
					<div class="overflow-hidden w-fit relative">
						<p class="animatedText text-3xl text-neutral-400 w-100">
							{info.description}
						</p>
					</div>
					<div class="overflow-hidden relative pr-8">
						<h3
							class="animatedText text-[9vw] tracking-tighter leading-none font-['Helvena'] uppercase"
						>
							{info.title}
						</h3>
					</div>
				</div>
				<div class="absolute top-32 text-right right-12 space-y-4">
					<div class="overflow-hidden w-fit relative">
						<p class="animatedText text-3xl text-neutral-400">
							{info.projects} projects
						</p>
					</div>
					<div class="overflow-hidden w-fit relative">
						<p class="animatedText text-3xl text-neutral-400">
							{info.Year}
						</p>
					</div>
				</div>
			</div>
		{/each}

		<div
			class="w-full h-200 bg-linear-to-b from-[#020202]/0 to-[#020202] absolute bottom-0 left-0 z-20"
		></div>
	</section>

	<section id="contact" class="py-24 px-6 bg-[#020202] scroll-mt-12">
		<div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-20 items-center">
			<div class="flex-1 text-center md:text-left">
				<h2 class="text-6xl md:text-8xl uppercase font-['Helvena'] mb-8">Parlons</h2>
				<p class="text-neutral-400 text-lg mb-8">Intéressé par mon travail ? Contactez-moi.</p>

				<div class="flex gap-6 justify-center md:justify-start">
					{#if socialLinks.instagram}
						<a href={socialLinks.instagram} target="_blank" class="hover:opacity-50 transition">
							<iconify-icon icon="ri:instagram-line" width="24"></iconify-icon>
						</a>
					{/if}
					{#if socialLinks.email}
						<a href={`mailto:${socialLinks.email}`} class="hover:opacity-50 transition">
							<iconify-icon icon="ri:mail-line" width="24"></iconify-icon>
						</a>
					{/if}
				</div>
			</div>

			<!-- <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="w-full md:w-[450px] space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <input bind:value={firstName} placeholder="Prénom" required class="w-full px-6 py-4 bg-white/10 border border-white/20 focus:border-white outline-none transition placeholder:text-neutral-500 font-light" />
                    <input bind:value={lastName} placeholder="Nom" required class="w-full px-6 py-4 bg-white/10 border border-white/20 focus:border-white outline-none transition placeholder:text-neutral-500 font-light" />
                </div>
                <input type="email" bind:value={email} placeholder="Email" required class="w-full px-6 py-4 bg-white/10 border border-white/20 focus:border-white outline-none transition placeholder:text-neutral-500 font-light" />
                <button disabled={loading} class="w-full bg-white text-black py-5 font-light uppercase tracking-widest hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-3">
                    {#if loading}
                        <iconify-icon icon="svg-spinners:18-dots-revolve" width="24"></iconify-icon>
                    {:else}
                        <iconify-icon icon="solar:letter-line-duotone" width="22"></iconify-icon>
                        Envoyer
                    {/if}
                </button>
                {#if message}
                    <div class="mt-4 text-center text-sm font-light {message.includes('Erreur') ? 'text-red-400' : 'text-green-400'}">
                        {message}
                    </div>
                {/if}
            </form> -->
		</div>
	</section>

	<footer class="pt-16 pb-8 px-10">
		<div class="max-w-7xl mx-auto text-center">
			<div class="text-lg font-light tracking-widest mb-6 uppercase">Laura Herve</div>
			<p class="text-sm text-neutral-500 font-light">
				&copy; {new Date().getFullYear()} Laura Herve. Tous droits réservés.
			</p>
		</div>
	</footer>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
		scrollbar-width: none;
	}
	:global(html::-webkit-scrollbar) {
		display: none;
	}
</style>
