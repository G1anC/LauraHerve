<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	// Props
	export let onComplete: (blobUrl: string) => void = () => {};

	// State
	let percentage = 0;
	let overlay: HTMLDivElement;
	let counter = { val: 0 }; // GSAP tweens plain objects

	onMount(() => {
		gsap.fromTo(
			'.startupText',
			{ yPercent: 110 },
			{
				yPercent: 0,
				duration: 1,
				ease: 'power3.out',
				stagger: 0.12,
			}
		);

		const xhr = new XMLHttpRequest();
		xhr.open('GET', '/4K_facade_clair.mp4', true);
		xhr.responseType = 'blob';

		xhr.onprogress = (e: ProgressEvent) => {
			if (!e.lengthComputable) return;
			const target = Math.round((e.loaded / e.total) * 100);
			animateTo(target);
		};

		xhr.onload = () => {
			animateTo(100, () => {
				const blobUrl = URL.createObjectURL(xhr.response);
				exitOverlay(blobUrl);
			});
		};

		xhr.onerror = () => {
			animateTo(100, () => exitOverlay(''));
		};

		setTimeout(() => xhr.send(), 1000); // ← start loading after 1s
	});
	function animateTo(target: number, onComplete?: () => void) {
		gsap.to(counter, {
			val: target,
			duration: 0.5,
			ease: 'power2.out',
			overwrite: true, // cancel previous tween if still running
			onUpdate: () => {
				percentage = Math.round(counter.val);
			},
			onComplete,
		});
	}

	function exitOverlay(blobUrl: string) {
		// Brief pause at 100% so the user sees it
		gsap.to(overlay, {
			delay: 0.4,
			yPercent: -100,
			duration: 1.1,
			ease: 'power4.inOut',
			onComplete: () => onComplete(blobUrl),
		});
	}
</script>

<div bind:this={overlay} class="fixed top-0 left-0 h-full w-screen bg-[#050505] z-[100]">
	<div class="absolute bottom-12 left-12">
		<div class="overflow-hidden w-fit relative">
			<p class="startupText text-3xl uppercase text-neutral-400 w-100">Laura Hervé<br/>Portfolio<br/>2026</p>
		</div>

		<div class="overflow-hidden relative pr-8">
			<h3 class="startupText text-[9vw] tracking-tighter leading-none font-['Helvena'] uppercase">
				{percentage}
			</h3>
		</div>
	</div>
</div>
