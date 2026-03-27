<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc';

	import Nav from '$lib/components/Nav.svelte';
	import StartupScreen from '$lib/components/StartupScreen.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import SiteFooter from '$lib/components/Footer.svelte';

	import { startupDone } from '$lib/stores/startup';

	let videoSrc = '';

	function handleComplete(blobUrl: string) {
		videoSrc = blobUrl;
		startupDone.set(true);
	}

	let socialLinks = { instagram: '', facebook: '', email: '' };

	onMount(() => {
		Promise.all([trpc.gallery.list.query(), trpc.about.get.query(), trpc.social.get.query()]).then(
			([_gallery, _about, social]) => {
				socialLinks = social || { instagram: '', facebook: '', email: '' };
			}
		);
	});
</script>

<div
	class="min-h-screen bg-[#050505] text-white font-['Helvena'] selection:text-black"
>
	<Nav />
	<StartupScreen onComplete={handleComplete} />
	<HeroSection {videoSrc} />
	<ContactSection {socialLinks} />
	<SiteFooter />
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
