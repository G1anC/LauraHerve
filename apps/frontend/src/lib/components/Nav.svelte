<script lang="ts">
    import { onMount } from 'svelte';
    import { startupDone } from '$lib/stores/startup';
    import gsap from 'gsap';

    let links: HTMLElement[] = [];

    onMount(() => {
        gsap.set(links, { yPercent: 110 });
    });

    $: if ($startupDone) {
        gsap.to(links, {
            yPercent: 0,
            duration: 2,
            ease: 'power2.inOut',
            stagger: 0.1,
        });
    }
</script>

<nav class="fixed top-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-[60]">
    <div class="w-full opacity-0">CONTACT</div>
    <div class="flex items-center gap-8 text-lg capitalize">
        {#each [
            { href: '/bundle?category=gallery', label: 'GALLERY' },
            { href: '/bundle?category=scenography', label: 'SCENOGRAPHY' },
            { href: '/bundle?category=video', label: 'VIDEOS' },
            { href: '/bundle?category=none', label: 'OTHER' },
        ] as link, i}
            <div class="overflow-hidden">
                <a
                    bind:this={links[i]}
                    href={link.href}
                    class="block hover:opacity-50 transition">
                    {link.label}
                </a>
            </div>
        {/each}
    </div>
    <div class="overflow-hidden w-full">
        <a href="/contact" bind:this={links[4]} class="w-full flex items-center justify-end gap-24 uppercase">
            CONTACT
        </a>
    </div>
</nav>