<script lang='ts'>
    enum Category {
        Gallery = "gallery",
        Sceno = "scenography",
        Video = "video",
        None = "none",
    }

    // get the category to display
    let { data }: { data: string } = $props()
    let category: Category = $state(Category[data as keyof typeof Category] || Category.None);

    //let infos = ...
</script>

<main class="w-screen h-screen overflow-hidden text-white bg-[#050505]">
    {category}

    <img src="/backgroundBlur.png" class="w-full h-full blur-[300px]" />
    <div class="w-full h-full">
        Hello mate
    </div>



</main>