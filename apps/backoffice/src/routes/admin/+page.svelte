<script lang="ts">
  import { resolve } from '$app/paths';
  import 'iconify-icon';

  const sections = [
    {
      title: 'Gallery',
      description: 'Upload, edit, and order the images shown on the landing page.',
      href: '/admin/gallery',
      icon: 'solar:gallery-bold',
    },
    {
      title: 'Statistics',
      description: 'Review the current gallery content and platform totals.',
      href: '/admin/statistics',
      icon: 'solar:chart-bold',
    },
    {
      title: 'Profile',
      description: 'Manage the admin account information used for the backoffice.',
      href: '/admin/profile',
      icon: 'solar:user-id-bold',
    },
  ];
</script>

<div class="p-8 max-w-[1400px] mx-auto space-y-8">
  <div class="space-y-3">
    <p class="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Backoffice</p>
    <h1 class="text-4xl font-black tracking-tighter text-slate-900">Admin Dashboard</h1>
    <p class="max-w-2xl text-slate-500">
      Use the sections below to manage the live content that is still supported by this backoffice.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {#each sections as section (section.href)}
      <a
        href={resolve(section.href)}
        class="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-black hover:shadow-xl hover:shadow-slate-200/70"
      >
        <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 transition-colors group-hover:bg-black group-hover:text-white">
          <iconify-icon icon={section.icon} width="26"></iconify-icon>
        </div>
        <h2 class="mb-2 text-2xl font-black tracking-tight text-slate-900">{section.title}</h2>
        <p class="mb-6 text-sm leading-6 text-slate-500">{section.description}</p>
        <span class="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-900">
          Open
          <iconify-icon icon="solar:arrow-right-linear" width="18"></iconify-icon>
        </span>
      </a>
    {/each}
  </div>
</div>
