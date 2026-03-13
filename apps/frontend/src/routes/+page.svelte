<script lang="ts">
  import { onMount } from 'svelte';
  import { trpc } from '$lib/trpc';
  import 'iconify-icon';

  let email = '',
    firstName = '',
    lastName = '',
    loading = false,
    message = '';

  let galleryItems: any[] = [];
  let aboutContent = '';
  let socialLinks = { instagram: '', facebook: '', email: '' };
  let dataLoading = true;

  const scrollTo = (id: string) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
      message = 'Erreur lors de l\'envoi. Veuillez réessayer.';
    }
    loading = false;
  }
</script>

<div class="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
  <nav
    class="fixed top-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-[100] bg-white/90 backdrop-blur-md border-b border-neutral-100"
  >
    <div class="text-xl font-light tracking-widest">LAURA HERVE</div>

    <div class="flex items-center gap-8 text-sm font-light uppercase tracking-wider">
      <button on:click={() => scrollTo('galerie')} class="hover:opacity-50 transition"
        >Galerie</button
      >
      <button on:click={() => scrollTo('apropos')} class="hover:opacity-50 transition"
        >À propos</button
      >
      <button on:click={() => scrollTo('contact')} class="hover:opacity-50 transition"
        >Contact</button
      >
    </div>
  </nav>

  <section class="relative pt-40 pb-32 px-6 flex flex-col items-center text-center">
    <h1
      class="text-7xl md:text-[10rem] font-extralight uppercase tracking-[0.3em] leading-[0.9] mb-8"
    >
      Laura<br />Herve
    </h1>
    <p class="text-xl md:text-2xl text-neutral-400 font-light tracking-widest uppercase mb-16">
      Artiste
    </p>

    <button
      on:click={() => scrollTo('galerie')}
      class="group flex items-center gap-3 text-sm font-light uppercase tracking-widest border border-black px-8 py-4 hover:bg-black hover:text-white transition-all duration-300"
    >
      Découvrir mon travail
      <iconify-icon icon="solar:arrow-down-line-duotone" width="20"></iconify-icon>
    </button>
  </section>

  <section id="galerie" class="py-24 px-6 scroll-mt-24">
    <div class="max-w-7xl mx-auto">
      <h2
        class="text-5xl md:text-7xl font-extralight uppercase tracking-[0.2em] mb-20 text-center"
      >
        Galerie
      </h2>

      {#if dataLoading}
        <div class="flex justify-center py-20">
          <iconify-icon
            icon="line-md:loading-twotone-loop"
            width="40"
            class="text-neutral-300"
          ></iconify-icon>
        </div>
      {:else if galleryItems.length === 0}
        <div class="text-center py-20 text-neutral-400 font-light">
          <p class="text-lg">Aucune œuvre pour le moment.</p>
          <p class="text-sm mt-2">Revenez bientôt pour découvrir mes créations.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each galleryItems as item}
            <div class="group relative overflow-hidden bg-neutral-50 aspect-square">
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
                <h3 class="text-2xl font-light mb-2">{item.title}</h3>
                {#if item.description}
                  <p class="text-sm font-light opacity-90 line-clamp-3 mb-3">
                    {item.description}
                  </p>
                {/if}
                {#if item.date}
                  <p class="text-xs uppercase tracking-wider opacity-70">{item.date}</p>
                {/if}
                {#if item.link}
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-wider hover:underline"
                  >
                    En savoir plus
                    <iconify-icon icon="solar:arrow-right-line-duotone" width="16"></iconify-icon>
                  </a>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <section id="apropos" class="py-32 px-6 bg-neutral-50 scroll-mt-24">
    <div class="max-w-4xl mx-auto">
      <h2
        class="text-5xl md:text-7xl font-extralight uppercase tracking-[0.2em] mb-16 text-center"
      >
        À propos
      </h2>

      {#if dataLoading}
        <div class="flex justify-center py-12">
          <iconify-icon
            icon="line-md:loading-twotone-loop"
            width="36"
            class="text-neutral-300"
          ></iconify-icon>
        </div>
      {:else if aboutContent}
        <div class="prose prose-lg max-w-none font-light leading-relaxed text-neutral-700">
          {@html aboutContent}
        </div>
      {:else}
        <p class="text-center text-neutral-400 font-light py-12">
          Biographie à venir...
        </p>
      {/if}
    </div>
  </section>

  <section
    id="contact"
    class="py-24 px-6 bg-black text-white rounded-none mx-0 mb-0 scroll-mt-12"
  >
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

      <form on:submit|preventDefault={handleSubmit} class="w-full md:w-[450px] space-y-4">
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

  <footer class="bg-white pt-16 pb-8 px-10 border-t border-neutral-100">
    <div class="max-w-7xl mx-auto text-center">
      <div class="text-lg font-light tracking-widest mb-6">LAURA HERVE</div>
      <p class="text-sm text-neutral-400 font-light">
        &copy; {new Date().getFullYear()} Laura Herve. Tous droits réservés.
      </p>
    </div>
  </footer>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
    overflow-y: auto !important;
  }
  :global(body) {
    overflow: auto !important;
    height: auto !important;
  }
</style>
