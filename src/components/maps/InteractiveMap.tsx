"use client";

import React, { useEffect, useRef, useState } from 'react';

interface InteractiveMapProps {
    location: string;
    className?: string;
    height?: string;
    apiKey: string;
    zoom?: number;
    markerTitle?: string;
}

// Declare google global type
declare global {
    interface Window {
        google: typeof google;
    }
}

export default function InteractiveMap({ 
    location, 
    className = "", 
    height = "h-64",
    apiKey,
    zoom = 15,
    markerTitle
}: InteractiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleMapRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
            setMapError('กรุณาใส่ Google Maps API Key');
            setIsLoading(false);
            return;
        }

        const loadGoogleMapsScript = () => {
            if (typeof window !== 'undefined' && window.google?.maps) {
                initMap();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => initMap();
            script.onerror = () => {
                setMapError('ไม่สามารถโหลด Google Maps ได้');
                setIsLoading(false);
            };
            document.head.appendChild(script);
        };

        const initMap = async () => {
            if (!mapRef.current || typeof window === 'undefined' || !window.google) return;

            try {
                const geocoder = new window.google.maps.Geocoder();
                
                const result = await geocoder.geocode({ address: location });
                
                if (result.results && result.results[0]) {
                    const position = result.results[0].geometry.location;

                    const map = new window.google.maps.Map(mapRef.current, {
                        center: position,
                        zoom: zoom,
                        mapTypeControl: true,
                        streetViewControl: true,
                        fullscreenControl: true,
                        zoomControl: true,
                    });

                    googleMapRef.current = map;

                    const marker = new window.google.maps.Marker({
                        position: position,
                        map: map,
                        title: markerTitle || location,
                        animation: window.google.maps.Animation.DROP,
                    });

                    markerRef.current = marker;

                    const infoWindow = new window.google.maps.InfoWindow({
                        content: `
                            <div style="padding: 10px; max-width: 200px;">
                                <h3 style="font-weight: bold; margin-bottom: 5px;">${markerTitle || 'สถานที่จัดค่าย'}</h3>
                                <p style="margin: 0; color: #666;">${location}</p>
                            </div>
                        `,
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });

                    setIsLoading(false);
                } else {
                    setMapError('ไม่พบสถานที่ที่ระบุ');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error initializing map:', error);
                setMapError('เกิดข้อผิดพลาดในการโหลดแผนที่');
                setIsLoading(false);
            }
        };

        loadGoogleMapsScript();

        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
            }
            if (googleMapRef.current) {
                googleMapRef.current = null;
            }
        };
    }, [location, apiKey, zoom, markerTitle]);

    const openInMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

    if (mapError) {
        return (
            <div className={`${height} ${className} rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6`}>
                <div className="text-center">
                    <p className="text-red-500 dark:text-red-400 mb-2 font-semibold">
                        {mapError}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        สามารถเปิดดูใน Google Maps แทนได้
                    </p>
                    <a
                        href={openInMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        เปิดใน Google Maps
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`${height} ${className} rounded-2xl overflow-hidden shadow-lg relative`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">กำลังโหลดแผนที่...</p>
                    </div>
                </div>
            )}
            <div ref={mapRef} className="w-full h-full" />
            
            <div className="absolute bottom-4 right-4">
                <a
                    href={openInMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-lg hover:shadow-xl transition-all text-sm font-medium"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    เปิดใน Maps
                </a>
            </div>
        </div>
    );
}
