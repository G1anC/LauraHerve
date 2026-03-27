<script lang="ts">
    import 'iconify-icon';

    export let socialLinks: { instagram: string; email: string; facebook: string };
</script>

<section id="contact" class="py-24 px-6 bg-[#050505] scroll-mt-12">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-20 items-center">
        <div class="flex-1 text-center md:text-left">
            <h2 class="text-6xl md:text-8xl uppercase font-['Helvena'] mb-8">Parlons</h2>
            <p class="text-neutral-400 text-lg mb-8">Intéressé par mon travail ? Contactez-moi.</p>
            <div class="flex gap-6 justify-center md:justify-start">
                {#if socialLinks.instagram}
                    <a href={socialLinks.instagram} target="_blank" title="instagram "class="hover:opacity-50 transition">
                        <iconify-icon icon="ri:instagram-line" width="24"></iconify-icon>
                    </a>
                {/if}
                {#if socialLinks.email}
                    <a href={`mailto:${socialLinks.email}`} title="mail" class="hover:opacity-50 transition">
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