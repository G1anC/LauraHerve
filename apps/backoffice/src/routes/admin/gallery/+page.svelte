<script lang="ts">
	import { trpc } from '$lib/trpc';
	import { Button, Modal, Input, Spinner, toast } from '@repo/ui';
	import { uploadFile } from '@repo/storage-client';
	import 'iconify-icon';

	let galleryItems = $state<any[]>([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let selectedItem = $state<any>(null);

	let createForm = $state({
		title: '',
		description: '',
		date: '',
		link: '',
		file: null as File | null,
	});

	let editForm = $state({
		id: '',
		title: '',
		description: '',
		date: '',
		link: '',
	});

	let uploading = $state(false);

	async function loadGallery() {
		try {
			loading = true;
			galleryItems = await trpc.gallery.listAll.query();
		} catch (err: any) {
			toast.error(err.message || 'Failed to load gallery items');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadGallery();
	});

	async function handleCreate() {
		if (!createForm.file || !createForm.title || !createForm.description || !createForm.date) {
			toast.error('Please fill in all required fields and select an image');
			return;
		}

		try {
			uploading = true;

			const { uploadUrl, fileKey, publicUrl } = await trpc.media.getUploadUrl.mutate({
				fileName: createForm.file.name,
				fileType: createForm.file.type,
			});

			await uploadFile(createForm.file, uploadUrl);

			const media = await trpc.media.create.mutate({
				url: publicUrl,
				key: fileKey,
				mimeType: createForm.file.type,
				size: createForm.file.size,
			});

			await trpc.gallery.create.mutate({
				title: createForm.title,
				description: createForm.description,
				date: createForm.date,
				link: createForm.link || null,
				mediaId: media.id,
			});

			toast.success('Gallery item created successfully!');
			showCreateModal = false;
			createForm = { title: '', description: '', date: '', link: '', file: null };
			await loadGallery();
		} catch (err: any) {
			toast.error(err.message || 'Failed to create gallery item');
		} finally {
			uploading = false;
		}
	}

	async function handleEdit() {
		if (!editForm.id || !editForm.title || !editForm.description || !editForm.date) {
			toast.error('Please fill in all required fields');
			return;
		}

		try {
			uploading = true;

			await trpc.gallery.update.mutate({
				id: editForm.id,
				title: editForm.title,
				description: editForm.description,
				date: editForm.date,
				link: editForm.link || null,
			});

			toast.success('Gallery item updated successfully!');
			showEditModal = false;
			await loadGallery();
		} catch (err: any) {
			toast.error(err.message || 'Failed to update gallery item');
		} finally {
			uploading = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this gallery item?')) return;

		try {
			await trpc.gallery.delete.mutate({ id });
			toast.success('Gallery item deleted successfully!');
			await loadGallery();
		} catch (err: any) {
			toast.error(err.message || 'Failed to delete gallery item');
		}
	}

	function openEditModal(item: any) {
		selectedItem = item;
		editForm = {
			id: item.id,
			title: item.title,
			description: item.description,
			date: item.date,
			link: item.link || '',
		};
		showEditModal = true;
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			createForm.file = target.files[0];
		}
	}
</script>

<div class="p-8 max-w-[1400px] mx-auto">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-black mb-2">Gallery</h1>
			<p class="text-slate-500">
				Manage your portfolio gallery ({galleryItems.length}/4 items)
			</p>
		</div>
		<Button
			onclick={() => (showCreateModal = true)}
			disabled={galleryItems.length >= 4}
			class="flex items-center gap-2"
		>
			<iconify-icon icon="solar:add-circle-bold" width="20"></iconify-icon>
			Add Item
		</Button>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Spinner />
		</div>
	{:else if galleryItems.length === 0}
		<div class="bg-white rounded-2xl border-2 border-slate-200 p-16 text-center">
			<iconify-icon icon="solar:gallery-bold" width="64" class="text-slate-300 mb-4"></iconify-icon
			>
			<h3 class="text-xl font-bold mb-2">No gallery items yet</h3>
			<p class="text-slate-500 mb-6">Create your first gallery item to get started</p>
			<Button onclick={() => (showCreateModal = true)} class="inline-flex items-center gap-2">
				<iconify-icon icon="solar:add-circle-bold" width="20"></iconify-icon>
				Create First Item
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each galleryItems as item (item.id)}
				<div class="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden group">
					<div class="aspect-video bg-slate-100 overflow-hidden">
						<img
							src={item.media.url}
							alt={item.title}
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						/>
					</div>
					<div class="p-6">
						<div class="flex items-start justify-between mb-3">
							<div>
								<h3 class="text-lg font-black mb-1">{item.title}</h3>
								<p class="text-sm text-slate-400">{item.date}</p>
							</div>
							<span class="text-sm font-bold text-slate-400">#{item.order + 1}</span>
						</div>
						<p class="text-slate-600 mb-4 line-clamp-2">{item.description}</p>
						{#if item.link}
							<a
								href={item.link}
								target="_blank"
								class="text-sm text-black hover:underline mb-4 inline-flex items-center gap-1"
							>
								<iconify-icon icon="solar:link-bold" width="16"></iconify-icon>
								View Link
							</a>
						{/if}
						<div class="flex gap-2 mt-4 pt-4 border-t border-slate-100">
							<Button
								intent="secondary"
								onclick={() => openEditModal(item)}
								class="flex-1 flex items-center justify-center gap-2"
							>
								<iconify-icon icon="solar:pen-bold" width="18"></iconify-icon>
								Edit
							</Button>
							<Button
								intent="danger"
								onclick={() => handleDelete(item.id)}
								class="flex-1 flex items-center justify-center gap-2"
							>
								<iconify-icon icon="solar:trash-bin-trash-bold" width="18"></iconify-icon>
								Delete
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showCreateModal}
	<Modal onClose={() => (showCreateModal = false)}>
		<div class="p-6">
			<h2 class="text-2xl font-black mb-6">Create Gallery Item</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleCreate();
				}}
				class="space-y-4"
			>
				<div>
					<label class="block text-sm font-bold mb-2">Title *</label>
					<Input
						type="text"
						bind:value={createForm.title}
						placeholder="Enter title"
						required
						class="w-full"
					/>
				</div>

				<div>
					<label class="block text-sm font-bold mb-2">Date *</label>
					<Input
						type="text"
						bind:value={createForm.date}
						placeholder="e.g., 2024 or January 2024"
						required
						class="w-full"
					/>
				</div>

				<div>
					<label class="block text-sm font-bold mb-2">Description *</label>
					<textarea
						bind:value={createForm.description}
						placeholder="Enter description"
						required
						rows="4"
						class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-black focus:outline-none transition-colors resize-none"
					></textarea>
				</div>

				<div>
					<label class="block text-sm font-bold mb-2">Link (optional)</label>
					<Input
						type="url"
						bind:value={createForm.link}
						placeholder="https://..."
						class="w-full"
					/>
				</div>

				<div>
					<label class="block text-sm font-bold mb-2">Image *</label>
					<input
						type="file"
						accept="image/*"
						onchange={handleFileChange}
						required
						class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-black focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black file:text-white file:font-bold file:cursor-pointer hover:file:bg-slate-800"
					/>
					{#if createForm.file}
						<p class="text-sm text-slate-500 mt-2">
							Selected: {createForm.file.name}
						</p>
					{/if}
				</div>

				<div class="flex gap-3 pt-4">
					<Button
						type="button"
						intent="secondary"
						onclick={() => (showCreateModal = false)}
						class="flex-1"
						disabled={uploading}
					>
						Cancel
					</Button>
					<Button type="submit" class="flex-1" disabled={uploading}>
						{uploading ? 'Creating...' : 'Create Item'}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
{/if}

{#if showEditModal}
	<Modal onClose={() => (showEditModal = false)}>
		<div class="p-6">
			<h2 class="text-2xl font-black mb-6">Edit Gallery Item</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleEdit();
				}}
				class="space-y-4"
			>
				<div>
					<label class="block text-sm font-bold mb-2">Title *</label>
					<Input
						type="text"
						bind:value={editForm.title}
						placeholder="Enter title"
						required
						class="w-full"
					/>
				</div>

				<div>
					<label class="block text-sm font-bold mb-2">Date *</label>
					<Input
						type="text"
						bind:value={editForm.date}
						placeholder="e.g., 2024 or January 2024"
						required
						class="w-full"
					/>
				</div>

				<div>
					<label class="block text-sm font-bold mb-2">Description *</label>
					<textarea
						bind:value={editForm.description}
						placeholder="Enter description"
						required
						rows="4"
						class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-black focus:outline-none transition-colors resize-none"
					></textarea>
				</div>

				<div>
					<label class="block text-sm font-bold mb-2">Link (optional)</label>
					<Input type="url" bind:value={editForm.link} placeholder="https://..." class="w-full" />
				</div>

				<div class="flex gap-3 pt-4">
					<Button
						type="button"
						intent="secondary"
						onclick={() => (showEditModal = false)}
						class="flex-1"
						disabled={uploading}
					>
						Cancel
					</Button>
					<Button type="submit" class="flex-1" disabled={uploading}>
						{uploading ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
{/if}
