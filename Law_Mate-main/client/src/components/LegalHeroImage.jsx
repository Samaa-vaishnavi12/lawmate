import React from 'react';

const LegalHeroImage = () => (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="img-fluid" style={{ maxHeight: '400px' }}>
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#4e54c8', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#8f94fb', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <circle cx="250" cy="250" r="240" fill="url(#grad1)" opacity="0.1" />
        <g transform="translate(100, 100) scale(0.6)">
            <path fill="#4e54c8" d="M250 50 L250 450 M100 450 L400 450 M250 50 L100 200 L400 200 Z" stroke="#333" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fillOpacity="0"/>
            <path d="M50 200 L150 200 L100 300 Z" fill="#fff" opacity="0.8"/>
            <path d="M350 200 L450 200 L400 300 Z" fill="#fff" opacity="0.8"/>
            <path fill="none" stroke="#4e54c8" strokeWidth="15" strokeLinecap="round" d="M250 40 L250 400 M120 180 L380 180 M120 180 L70 300 M380 180 L430 300" />
            <path fill="#8f94fb" d="M20 300 Q70 360 120 300 Z" opacity="0.8"/>
            <path fill="#8f94fb" d="M380 300 Q430 360 480 300 Z" opacity="0.8"/>
        </g>
        <text x="50%" y="90%" dominantBaseline="middle" textAnchor="middle" fill="#4e54c8" fontSize="35" fontWeight="bold" fontFamily="sans-serif">
            Law Mate
        </text>
    </svg>
);

export default LegalHeroImage;
