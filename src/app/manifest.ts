import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SkillScout | ค้นหาค่ายและกิจกรรมสำหรับนักเรียนนักศึกษา',
        short_name: 'SkillScout',
        description: 'แพลตฟอร์มรวบรวมค่าย กิจกรรม กิจกรรมอาสา และอีเวนต์สำหรับนักเรียนนักศึกษาที่ดีที่สุดในไทย',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#F2B33D',
        icons: [
            {
                src: '/SSKLogo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/SSKLogo.png',
                sizes: '512x512',
                type: 'image/png',
            }
        ],
    };
}
