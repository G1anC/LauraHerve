<script lang="ts">
    import { onMount } from 'svelte';
    import gsap from 'gsap';
    import { hoverInfos, colorMap } from '$lib/data/hoverInfos';

    export let videoSrc: string = '';
    let video: HTMLVideoElement;
    let canvas: HTMLCanvasElement;
    let containers: HTMLElement[] = [];
    let ctx: CanvasRenderingContext2D | null = null;
    let overlayImage: HTMLImageElement | null = null;
    let activeColor: string | null = null;

    $: if (videoSrc && video) {
        gsap.to(video, { opacity: 1, duration: 1.2, ease: 'power2.out' });
    }



    function preloadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
            img.src = src;
        });
    }



    function drawCanvas() {
        if (!canvas || !overlayImage || !video)
            return;

        ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx)
            return;

        const rect = video.getBoundingClientRect();
        
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.width  = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        canvas.style.left   = `${rect.left}px`;
        canvas.style.top    = `${rect.top}px`;

        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    }

    

    function handleHover(event: MouseEvent) {
        if (!canvas || !ctx)
            return;

        const rect = canvas.getBoundingClientRect();

        const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
        const y = Math.floor((event.clientY - rect.top)  * (canvas.height / rect.height));

        try {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            let newHex: string | null = null;

            if (pixel[3] !== 0) {
                //transform the pixel colors info into hex color 
                const tmp = '#' + [pixel[0], pixel[1], pixel[2]]
                    .map(v => v.toString(16)
                        .padStart(2, '0'))
                        .join('')
                        .toUpperCase()

                newHex = tmp === '01FF00' ? '00FF00' : tmp;
            }
            if (activeColor === newHex)
                return;

            const prevIndex = activeColor !== null ? (colorMap[activeColor] ?? null) : null;
            const newIndex  = newHex   !== null ? (colorMap[newHex]    ?? null) : null;

            triggerAnimation(prevIndex, newIndex);

            activeColor = newHex;
        } catch {}
    }



    function getTargets(index: number) {
        return Array.from(containers[index]?.querySelectorAll('.animatedText') ?? []);
    }



    function triggerAnimation(prevIndex: number | null, newIndex: number | null) {
        const tl = gsap.timeline();

        if (prevIndex !== null) {
            const targets = getTargets(prevIndex);

            tl.to(targets, { y: '-100%', stagger: 0.1, duration: 0.5, ease: 'power3.out' });
            tl.set(targets, { y: '100%' });
        }

        if (newIndex !== null) {
            const targets = getTargets(newIndex);

            tl.set(targets, { y: '100%' });
            tl.to(targets, { y: '0', stagger: 0.1, duration: 0.5, ease: 'power3.out' });
        }
    }

    onMount(() => {
        gsap.set('.animatedText', { y: '100%' });
        preloadImage('/backgroundOverlay.png')
            .then(img => { overlayImage = img; drawCanvas(); })
            .catch(console.error);
    });
</script>

<svelte:window on:resize={drawCanvas} />

<section class="h-screen flex items-center uppercase tracking-normal justify-center relative overflow-hidden bg-black">

    <video
        bind:this={video}
        src={videoSrc}
        autoplay loop muted playsinline
        class="absolute inset-0 h-full w-full opacity-0 object-cover z-0"
    ></video>

    <canvas
        bind:this={canvas}
        onmousemove={handleHover}
        class="absolute inset-0 z-[70] opacity-0 cursor-crosshair pointer-events-auto"
    ></canvas>

    {#each hoverInfos as info, index}
        <div
            class="absolute inset-0 z-[55] pointer-events-none"
            bind:this={containers[index]}
        >
            <div class="absolute bottom-12 left-12">
                <div class="overflow-hidden w-fit relative">
                    <p class="animatedText text-3xl text-neutral-400">{info.description}</p>
                </div>
                <div class="overflow-hidden relative pr-8">
                    <h3 class="animatedText text-[9vw] tracking-tighter leading-none font-['Helvena'] uppercase">
                        {info.title}
                    </h3>
                </div>
            </div>
            <div class="absolute bottom-16 text-right right-12 space-y-4">
                <div class="overflow-hidden flex justify-between w-full relative">
                    <span class="text-3xl text-neutral-400">Projects:</span>
                    <p class="animatedText text-3xl text-neutral-400">{info.projects}</p>
                </div>
                <div class="overflow-hidden w-fit relative flex justify-between space-x-12">
                    <span class="text-3xl text-neutral-400">Years:</span>
                    <p class="animatedText text-3xl text-neutral-400">{info.year}</p>
                </div>
            </div>
        </div>
    {/each}

    <!-- Gradient fade to next section -->
    <!-- <div class="w-full h-200 bg-linear-to-b from-[#050505]/0 via-[#050505]/75 to-[#050505] absolute bottom-0 left-0 z-20"></div> -->

</section>