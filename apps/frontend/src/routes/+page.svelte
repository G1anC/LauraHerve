<script lang="ts">
  import { onMount } from 'svelte';
  import { trpc } from '$lib/trpc';
  import FullscreenCarousel from '$lib/components/FullscreenCarousel.svelte';
  import gsap from 'gsap';
  import 'iconify-icon';

  let hoverOverlay: HTMLDivElement;
  let hoverContent: HTMLDivElement;

	const hoverInfos = [
		{
			title: "VIDEOS",
			description: "See all the video projects I've done",
			projects: 12,
			Year: "2024 - 2025"
		},
		{
			title: "GALLERY",
			description: "Take a look at my photos",
			projects: 12,
			Year: "2024 - 2025"
		},
		{
			title: "SCENOGRAPHY",
			description: "See all the scenography projects I've done",
			projects: 12,
			Year: "2024 - 2025"
		},
		{
			title: "SANDBOX",
			description: "See all the sandbox projects I've done",
			projects: 12,
			Year: "2024 - 2025"
		}
	]
  let email = '',
    firstName = '',
    lastName = '',
    loading = false,
    message = '';

  let galleryItems: any[] = [];
  let aboutContent = '';
  let socialLinks = { instagram: '', facebook: '', email: '' };
  let dataLoading = true;
  let showCarousel = false;
  let carouselStartIndex = 0;
  let currentHoverIndex = 0;

  function handleCornerHover(enter: boolean, index: number) {
    if (enter) {
      currentHoverIndex = index;
      if (hoverOverlay && hoverContent) {
        gsap.to(hoverOverlay, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out'
        });
        gsap.fromTo(hoverContent, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
        );
      }
    } else if (!enter && hoverOverlay && hoverContent) {
      gsap.to(hoverOverlay, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
      gsap.to(hoverContent, {
        y: -20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  function openCarousel(index: number) {
    carouselStartIndex = index;
    showCarousel = true;
  }

  onMount(async () => {
    try {
      const [gallery, about, social] = await Promise.all([
        trpc.gallery.list.query(),
        trpc.about.get.query(),
        trpc.social.get.query(),
      ]);

      galleryItems = gallery || [];
      aboutContent = about?.content || '';
      socialLinks = social || { instagram: null, facebook: null, email: null };
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      dataLoading = false;
    }
  });

  async function handleSubmit() {
    loading = true;
    try {
      await trpc.contact.create.mutate({ email, firstName, lastName });
      message = 'Merci pour votre message ! Je vous répondrai bientôt.';
      email = firstName = lastName = '';
    } catch (error: unknown) {
      console.error('Failed to submit contact form:', error);
      message = "Erreur lors de l'envoi. Veuillez réessayer.";
    }
    loading = false;
  }
</script>

<div class="min-h-screen bg-[#0e0e0e] text-black font-sans selection:bg-black selection:text-white">
  <nav class="fixed top-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 text-white">
	<div class="w-full" />
    <div class="flex items-center gap-8 text-lg capitalize">
      <button onclick={() => scrollTo('galerie')} class="hover:opacity-50 transition"
        >GALLERY</button
      >
      <button onclick={() => scrollTo('contact')} class="hover:opacity-50 transition"
        >SCENOGRAPHY</button
      >
	  <button onclick={() => scrollTo('contact')} class="hover:opacity-50 transition"
        >VIDEOS</button
      >
	  <button onclick={() => scrollTo('contact')} class="hover:opacity-50 transition"
        >OTHER</button
      >
    </div>
	<div class="w-full flex items-center justify-end gap-24">
		<div class="h-6 w-6 aspect-square rounded-full bg-white/20"></div>
		CONTACT
	</div>
  </nav>

  <section class="h-screen flex items-center text-white justify-center px-6 relative">
	<video 
	  src='/4K_facade_clair.mp4' 
	  autoplay 
	  loop 
	  muted 
	  playsinline 
	  class="absolute inset-0 h-screen w-screen object-cover"
	></video>
	
	<!-- 4 Corner Hover Zones -->
	<div class="absolute inset-0 grid grid-cols-2 grid-rows-2 z-10">
	  <!-- Top Left -->
	  <a href='/'
	  	title=""
	    class="cursor-pointer"
	    onmouseenter={() => handleCornerHover(true, 0)}
	    onmouseleave={() => handleCornerHover(false, 0)}
	  ></a>
	  
	  <!-- Top Right -->
	  <a href='/'
	  	title=""
	    class="cursor-pointer"
	    onmouseenter={() => handleCornerHover(true, 1)}
	    onmouseleave={() => handleCornerHover(false, 1)}
	  ></a>
	  
	  <!-- Bottom Left -->
	  <a href='/'
	  	title=""
	    class="cursor-pointer"
	    onmouseenter={() => handleCornerHover(true, 2)}
	    onmouseleave={() => handleCornerHover(false, 2)}
	  ></a>
	  
	  <!-- Bottom Right -->
	  <a href='/'
	  	title=""
	    class="cursor-pointer"
	    onmouseenter={() => handleCornerHover(true, 3)}
	    onmouseleave={() => handleCornerHover(false, 3)}
	  ></a>
	</div>
	
	<!-- Hover Overlay Content -->
	<div 
	  bind:this={hoverOverlay}
	  class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
	  style="opacity: 0;"
	>
	  <div bind:this={hoverContent} class="w-screen h-screen" style="opacity: 0;">
		<div class="absolute bottom-0 left-8">
			<p class="text-3xl text-neutral-300">{hoverInfos[currentHoverIndex].description}</p>
			<h3 class="text-[160px] font-light uppercase">{hoverInfos[currentHoverIndex].title}</h3>
		</div>
		<div class="absolute top-32 text-left right-8 space-y-4">
			<p class="text-3xl text-neutral-300">{hoverInfos[currentHoverIndex].projects} projects</p>
			<p class="text-3xl text-neutral-300">{hoverInfos[currentHoverIndex].Year}</p>
		</div>
	  </div>
	</div>
	</section>	

  <!-- <section id="galerie" class="py-24 px-6 scroll-mt-24">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-5xl md:text-7xl font-extralight uppercase tracking-[0.2em] mb-20 text-center">
        Galerie
      </h2>

      {#if dataLoading}
        <div class="flex justify-center py-20">
          <iconify-icon icon="line-md:loading-twotone-loop" width="40" class="text-neutral-300"
          ></iconify-icon>
        </div>
      {:else if galleryItems.length === 0}
        <div class="text-center py-20 text-neutral-400 font-light">
          <p class="text-lg">Aucune œuvre pour le moment.</p>
          <p class="text-sm mt-2">Revenez bientôt pour découvrir mes créations.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {#each galleryItems as item, idx}
            <button
              onclick={() => openCarousel(idx)}
              class="group relative overflow-hidden bg-neutral-50 aspect-square cursor-pointer"
            >
              {#if item.media?.url}
                <img
                  src={item.media.url}
                  alt={item.title}
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              {/if}

              <div
                class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white"
              >
                <div
                  class="flex items-center gap-2 mb-3 text-sm uppercase tracking-wider opacity-70"
                >
                  <iconify-icon icon="solar:eye-bold" width="20"></iconify-icon>
                  Cliquez pour voir en plein écran
                </div>
                <h3 class="text-2xl font-light mb-2">{item.title}</h3>
                {#if item.date}
                  <p class="text-xs uppercase tracking-wider opacity-70">{item.date}</p>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <section id="apropos" class="py-32 px-6 bg-[#0e0e0e] scroll-mt-24">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-5xl md:text-7xl font-extralight uppercase tracking-[0.2em] mb-16 text-center">
        À propos
      </h2>

      {#if dataLoading}
        <div class="flex justify-center py-12">
          <iconify-icon icon="line-md:loading-twotone-loop" width="36" class="text-neutral-300"
          ></iconify-icon>
        </div>
      {:else if aboutContent}
        <div class="prose prose-lg max-w-none font-light leading-relaxed text-neutral-700">
          {@html aboutContent}
        </div>
      {:else}
        <p class="text-center text-neutral-400 font-light py-12">Biographie à venir...</p>
      {/if}
    </div>
  </section> -->

  <section id="contact" class="py-24 px-6 bg-[#0e0e0e] text-white rounded-none mx-0 mb-0 scroll-mt-12">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-20 items-center">
      <div class="flex-1 text-center md:text-left">
        <h2
          class="text-6xl md:text-8xl font-extralight uppercase tracking-[0.2em] mb-8 text-balance"
        >
          Parlons
        </h2>
        <p class="text-neutral-400 text-lg font-light mb-8">
          Intéressé par mon travail ? N'hésitez pas à me contacter.
        </p>

        {#if socialLinks.instagram || socialLinks.facebook || socialLinks.email}
          <div class="flex gap-6 justify-center md:justify-start">
            {#if socialLinks.instagram}
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                class="hover:opacity-50 transition"
                aria-label="Instagram"
              >
                <iconify-icon icon="ri:instagram-line" width="24"></iconify-icon>
              </a>
            {/if}
            {#if socialLinks.facebook}
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                class="hover:opacity-50 transition"
                aria-label="Facebook"
              >
                <iconify-icon icon="ri:facebook-line" width="24"></iconify-icon>
              </a>
            {/if}
            {#if socialLinks.email}
              <a
                href={`mailto:${socialLinks.email}`}
                class="hover:opacity-50 transition"
                aria-label="Email"
              >
                <iconify-icon icon="ri:mail-line" width="24"></iconify-icon>
              </a>
            {/if}
          </div>
        {/if}
      </div>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        class="w-full md:w-[450px] space-y-4"
      >
        <div class="grid grid-cols-2 gap-4">
          <input
            bind:value={firstName}
            placeholder="Prénom"
            required
            class="w-full px-6 py-4 bg-white/10 border border-white/20 focus:border-white outline-none transition placeholder:text-neutral-500 font-light"
          />
          <input
            bind:value={lastName}
            placeholder="Nom"
            required
            class="w-full px-6 py-4 bg-white/10 border border-white/20 focus:border-white outline-none transition placeholder:text-neutral-500 font-light"
          />
        </div>
        <input
          type="email"
          bind:value={email}
          placeholder="Email"
          required
          class="w-full px-6 py-4 bg-white/10 border border-white/20 focus:border-white outline-none transition placeholder:text-neutral-500 font-light"
        />
        <button
          disabled={loading}
          class="w-full bg-white text-black py-5 font-light uppercase tracking-widest hover:bg-neutral-200 transition disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {#if loading}
            <iconify-icon icon="svg-spinners:18-dots-revolve" width="24"></iconify-icon>
            Envoi en cours...
          {:else}
            <iconify-icon icon="solar:letter-line-duotone" width="22"></iconify-icon>
            Envoyer
          {/if}
        </button>
        {#if message}
          <div
            class="mt-4 text-center text-sm font-light tracking-wide {message.includes('Erreur')
              ? 'text-red-400'
              : 'text-green-400'}"
          >
            {message}
          </div>
        {/if}
      </form>
    </div>
  </section>

  <footer class=" pt-16 pb-8 px-10">
    <div class="max-w-7xl mx-auto text-center">
      <div class="text-lg font-light tracking-widest mb-6">LAURA HERVE</div>
      <p class="text-sm text-neutral-400 font-light">
        &copy; {new Date().getFullYear()} Laura Herve. Tous droits réservés.
      </p>
    </div>
  </footer>
</div>

{#if showCarousel && galleryItems.length > 0}
  <FullscreenCarousel
    items={galleryItems}
    initialIndex={carouselStartIndex}
    onClose={() => (showCarousel = false)}
  />
{/if}

<style>
  :global(html) {
    scroll-behavior: smooth;
    overflow-y: auto !important;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  :global(html::-webkit-scrollbar) {
    display: none; /* Chrome, Safari, Opera */
  }
  :global(body) {
    overflow: auto !important;
    height: auto !important;
  }
</style>
