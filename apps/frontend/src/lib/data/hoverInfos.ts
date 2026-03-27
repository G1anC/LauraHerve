export const hoverInfos = [
    {
        title: 'VIDEOS',
        description: "See all the video projects I've done",
        projects: 12,
        year: '2024 - 2025',
    },
    {
        title: 'GALLERY',
        description: 'Take a look at my photos',
        projects: 12,
        year: '2024 - 2025',
    },
    {
        title: 'SCENOGRAPHY',
        description: "See all the scenography projects I've done",
        projects: 12,
        year: '2024 - 2025',
    },
    {
        title: 'SANDBOX',
        description: "See all the sandbox projects I've done",
        projects: 12,
        year: '2024 - 2025',
    },
];

// Maps pixel hex color → hoverInfos index
export const colorMap: Record<string, number> = {
    '#00FF00': 0,
    '#01FF00': 0,
    '#0000FF': 1,
    '#FF0000': 2,
    '#FFFFFF': 3,
    '#00FFFF': 4
};