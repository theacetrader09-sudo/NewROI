"use client";

import { useEffect, useState } from "react";

interface PayoutItem {
    id: string;
    name: string;
    amount: number;
    country: string;
    countryFlag: string;
}

// MASSIVE pool of diverse user names (240+ entries with 60+ Indian names)
const DEMO_NAMES = [
    // Indian clients (60+ names = ~25% of total pool)
    { name: "Raj K.", country: "India", flag: "🇮🇳" },
    { name: "Priya S.", country: "India", flag: "🇮🇳" },
    { name: "Arjun M.", country: "India", flag: "🇮🇳" },
    { name: "Ananya P.", country: "India", flag: "🇮🇳" },
    { name: "Vikram R.", country: "India", flag: "🇮🇳" },
    { name: "Ishaan T.", country: "India", flag: "🇮🇳" },
    { name: "Diya N.", country: "India", flag: "🇮🇳" },
    { name: "Rohan S.", country: "India", flag: "🇮🇳" },
    { name: "Aditya K.", country: "India", flag: "🇮🇳" },
    { name: "Kavya B.", country: "India", flag: "🇮🇳" },
    { name: "Sanjay D.", country: "India", flag: "🇮🇳" },
    { name: "Neha V.", country: "India", flag: "🇮🇳" },
    { name: "Karan G.", country: "India", flag: "🇮🇳" },
    { name: "Sneha L.", country: "India", flag: "🇮🇳" },
    { name: "Aarav W.", country: "India", flag: "🇮🇳" },
    { name: "Riya C.", country: "India", flag: "🇮🇳" },
    { name: "Amit J.", country: "India", flag: "🇮🇳" },
    { name: "Pooja H.", country: "India", flag: "🇮🇳" },
    { name: "Deepak M.", country: "India", flag: "🇮🇳" },
    { name: "Shreya A.", country: "India", flag: "🇮🇳" },
    { name: "Nikhil P.", country: "India", flag: "🇮🇳" },
    { name: "Anjali R.", country: "India", flag: "🇮🇳" },
    { name: "Rahul D.", country: "India", flag: "🇮🇳" },
    { name: "Meera K.", country: "India", flag: "🇮🇳" },
    { name: "Siddharth B.", country: "India", flag: "🇮🇳" },
    { name: "Nisha G.", country: "India", flag: "🇮🇳" },
    { name: "Varun S.", country: "India", flag: "🇮🇳" },
    { name: "Akshara M.", country: "India", flag: "🇮🇳" },
    { name: "Harsh V.", country: "India", flag: "🇮🇳" },
    { name: "Tanya L.", country: "India", flag: "🇮🇳" },
    { name: "Yash T.", country: "India", flag: "🇮🇳" },
    { name: "Isha N.", country: "India", flag: "🇮🇳" },
    { name: "Kunal W.", country: "India", flag: "🇮🇳" },
    { name: "Divya C.", country: "India", flag: "🇮🇳" },
    { name: "Manish H.", country: "India", flag: "🇮🇳" },
    { name: "Simran J.", country: "India", flag: "🇮🇳" },
    { name: "Abhishek F.", country: "India", flag: "🇮🇳" },
    { name: "Sapna R.", country: "India", flag: "🇮🇳" },
    { name: "Vishal K.", country: "India", flag: "🇮🇳" },
    { name: "Tanvi B.", country: "India", flag: "🇮🇳" },
    { name: "Tarun S.", country: "India", flag: "🇮🇳" },
    { name: "Ritika M.", country: "India", flag: "🇮🇳" },
    { name: "Shubham D.", country: "India", flag: "🇮🇳" },
    { name: "Kriti P.", country: "India", flag: "🇮🇳" },
    { name: "Gaurav L.", country: "India", flag: "🇮🇳" },
    { name: "Megha V.", country: "India", flag: "🇮🇳" },
    { name: "Mohit A.", country: "India", flag: "🇮🇳" },
    { name: "Swati G.", country: "India", flag: "🇮🇳" },
    { name: "Pankaj R.", country: "India", flag: "🇮🇳" },
    { name: "Nidhi T.", country: "India", flag: "🇮🇳" },
    { name: "Samir N.", country: "India", flag: "🇮🇳" },
    { name: "Pallavi K.", country: "India", flag: "🇮🇳" },
    { name: "Rajesh M.", country: "India", flag: "🇮🇳" },
    { name: "Lata S.", country: "India", flag: "🇮🇳" },
    { name: "Suresh B.", country: "India", flag: "🇮🇳" },
    { name: "Seema D.", country: "India", flag: "🇮🇳" },
    { name: "Naveen H.", country: "India", flag: "🇮🇳" },
    { name: "Preeti W.", country: "India", flag: "🇮🇳" },
    { name: "Ramesh C.", country: "India", flag: "🇮🇳" },
    { name: "Sunita J.", country: "India", flag: "🇮🇳" },

    // United States (30 names)
    { name: "Michael R.", country: "United States", flag: "🇺🇸" },
    { name: "Jessica T.", country: "United States", flag: "🇺🇸" },
    { name: "David L.", country: "United States", flag: "🇺🇸" },
    { name: "Sarah M.", country: "United States", flag: "🇺🇸" },
    { name: "James W.", country: "United States", flag: "🇺🇸" },
    { name: "Emily D.", country: "United States", flag: "🇺🇸" },
    { name: "Robert K.", country: "United States", flag: "🇺🇸" },
    { name: "Jennifer B.", country: "United States", flag: "🇺🇸" },
    { name: "Christopher H.", country: "United States", flag: "🇺🇸" },
    { name: "Amanda S.", country: "United States", flag: "🇺🇸" },
    { name: "Matthew P.", country: "United States", flag: "🇺🇸" },
    { name: "Ashley N.", country: "United States", flag: "🇺🇸" },
    { name: "Daniel F.", country: "United States", flag: "🇺🇸" },
    { name: "Lauren G.", country: "United States", flag: "🇺🇸" },
    { name: "Andrew V.", country: "United States", flag: "🇺🇸" },
    { name: "Megan C.", country: "United States", flag: "🇺🇸" },
    { name: "Joshua R.", country: "United States", flag: "🇺🇸" },
    { name: "Rachel A.", country: "United States", flag: "🇺🇸" },
    { name: "Brandon L.", country: "United States", flag: "🇺🇸" },
    { name: "Stephanie K.", country: "United States", flag: "🇺🇸" },
    { name: "Tyler M.", country: "United States", flag: "🇺🇸" },
    { name: "Nicole E.", country: "United States", flag: "🇺🇸" },
    { name: "Justin B.", country: "United States", flag: "🇺🇸" },
    { name: "Brittany W.", country: "United States", flag: "🇺🇸" },
    { name: "Kevin D.", country: "United States", flag: "🇺🇸" },
    { name: "Samantha J.", country: "United States", flag: "🇺🇸" },
    { name: "Ryan H.", country: "United States", flag: "🇺🇸" },
    { name: "Taylor S.", country: "United States", flag: "🇺🇸" },
    { name: "Nathan P.", country: "United States", flag: "🇺🇸" },
    { name: "Kayla T.", country: "United States", flag: "🇺🇸" },

    // United Kingdom (20 names)
    { name: "Emma S.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Oliver J.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Charlotte W.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Harry B.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Sophie T.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "George M.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Amelia R.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Jack D.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Isla K.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Noah L.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Poppy H.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Thomas C.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Lily F.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Oscar P.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Freya N.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "William G.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Grace V.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "James R.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Ava M.", country: "United Kingdom", flag: "🇬🇧" },
    { name: "Charlie B.", country: "United Kingdom", flag: "🇬🇧" },

    // Germany (15 names)
    { name: "Anna M.", country: "Germany", flag: "🇩🇪" },
    { name: "Hans K.", country: "Germany", flag: "🇩🇪" },
    { name: "Klaus W.", country: "Germany", flag: "🇩🇪" },
    { name: "Greta S.", country: "Germany", flag: "🇩🇪" },
    { name: "Stefan B.", country: "Germany", flag: "🇩🇪" },
    { name: "Petra L.", country: "Germany", flag: "🇩🇪" },
    { name: "Markus H.", country: "Germany", flag: "🇩🇪" },
    { name: "Sabine R.", country: "Germany", flag: "🇩🇪" },
    { name: "Lukas F.", country: "Germany", flag: "🇩🇪" },
    { name: "Julia N.", country: "Germany", flag: "🇩🇪" },
    { name: "Thomas D.", country: "Germany", flag: "🇩🇪" },
    { name: "Kathrin G.", country: "Germany", flag: "🇩🇪" },
    { name: "Michael P.", country: "Germany", flag: "🇩🇪" },
    { name: "Monika V.", country: "Germany", flag: "🇩🇪" },
    { name: "Felix C.", country: "Germany", flag: "🇩🇪" },

    // France (12 names)
    { name: "Sophie L.", country: "France", flag: "🇫🇷" },
    { name: "Pierre D.", country: "France", flag: "🇫🇷" },
    { name: "Marie C.", country: "France", flag: "🇫🇷" },
    { name: "Jean-Luc R.", country: "France", flag: "🇫🇷" },
    { name: "Camille B.", country: "France", flag: "🇫🇷" },
    { name: "Antoine M.", country: "France", flag: "🇫🇷" },
    { name: "Isabelle H.", country: "France", flag: "🇫🇷" },
    { name: "Louis F.", country: "France", flag: "🇫🇷" },
    { name: "Chloé N.", country: "France", flag: "🇫🇷" },
    { name: "Nicolas P.", country: "France", flag: "🇫🇷" },
    { name: "Emilie G.", country: "France", flag: "🇫🇷" },
    { name: "Julien V.", country: "France", flag: "🇫🇷" },

    // Brazil (12 names)
    { name: "Carlos G.", country: "Brazil", flag: "🇧🇷" },
    { name: "Gabriela S.", country: "Brazil", flag: "🇧🇷" },
    { name: "Lucas M.", country: "Brazil", flag: "🇧🇷" },
    { name: "Juliana P.", country: "Brazil", flag: "🇧🇷" },
    { name: "Rafael O.", country: "Brazil", flag: "🇧🇷" },
    { name: "Fernanda T.", country: "Brazil", flag: "🇧🇷" },
    { name: "Bruno L.", country: "Brazil", flag: "🇧🇷" },
    { name: "Amanda R.", country: "Brazil", flag: "🇧🇷" },
    { name: "Pedro K.", country: "Brazil", flag: "🇧🇷" },
    { name: "Beatriz D.", country: "Brazil", flag: "🇧🇷" },
    { name: "Thiago V.", country: "Brazil", flag: "🇧🇷" },
    { name: "Larissa N.", country: "Brazil", flag: "🇧🇷" },

    // Japan (12 names)
    { name: "Yuki T.", country: "Japan", flag: "🇯🇵" },
    { name: "Hiroshi N.", country: "Japan", flag: "🇯🇵" },
    { name: "Sakura K.", country: "Japan", flag: "🇯🇵" },
    { name: "Takeshi M.", country: "Japan", flag: "🇯🇵" },
    { name: "Yumi S.", country: "Japan", flag: "🇯🇵" },
    { name: "Ken D.", country: "Japan", flag: "🇯🇵" },
    { name: "Akiko R.", country: "Japan", flag: "🇯🇵" },
    { name: "Daichi F.", country: "Japan", flag: "🇯🇵" },
    { name: "Haruka B.", country: "Japan", flag: "🇯🇵" },
    { name: "Ryo H.", country: "Japan", flag: "🇯🇵" },
    { name: "Nana L.", country: "Japan", flag: "🇯🇵" },
    { name: "Kenji P.", country: "Japan", flag: "🇯🇵" },

    // China (12 names)
    { name: "Li Wei", country: "China", flag: "🇨🇳" },
    { name: "Wang Chen", country: "China", flag: "🇨🇳" },
    { name: "Zhang Min", country: "China", flag: "🇨🇳" },
    { name: "Liu Yang", country: "China", flag: "🇨🇳" },
    { name: "Chen Xiao", country: "China", flag: "🇨🇳" },
    { name: "Wu Jing", country: "China", flag: "🇨🇳" },
    { name: "Huang Lei", country: "China", flag: "🇨🇳" },
    { name: "Zhao Ying", country: "China", flag: "🇨🇳" },
    { name: "Zhou Na", country: "China", flag: "🇨🇳" },
    { name: "Xu Long", country: "China", flag: "🇨🇳" },
    { name: "Sun Mei", country: "China", flag: "🇨🇳" },
    { name: "Ma Qiang", country: "China", flag: "🇨🇳" },

    // UAE (10 names)
    { name: "Mohammed A.", country: "UAE", flag: "🇦🇪" },
    { name: "Fatima H.", country: "UAE", flag: "🇦🇪" },
    { name: "Ahmed K.", country: "UAE", flag: "🇦🇪" },
    { name: "Layla M.", country: "UAE", flag: "🇦🇪" },
    { name: "Omar S.", country: "UAE", flag: "🇦🇪" },
    { name: "Aisha D.", country: "UAE", flag: "🇦🇪" },
    { name: "Ali R.", country: "UAE", flag: "🇦🇪" },
    { name: "Mariam F.", country: "UAE", flag: "🇦🇪" },
    { name: "Khalid B.", country: "UAE", flag: "🇦🇪" },
    { name: "Noura L.", country: "UAE", flag: "🇦🇪" },

    // Australia (10 names)
    { name: "Olivia W.", country: "Australia", flag: "🇦🇺" },
    { name: "Liam J.", country: "Australia", flag: "🇦🇺" },
    { name: "Emma K.", country: "Australia", flag: "🇦🇺" },
    { name: "Noah B.", country: "Australia", flag: "🇦🇺" },
    { name: "Mia R.", country: "Australia", flag: "🇦🇺" },
    { name: "Lucas H.", country: "Australia", flag: "🇦🇺" },
    { name: "Chloe M.", country: "Australia", flag: "🇦🇺" },
    { name: "Ethan D.", country: "Australia", flag: "🇦🇺" },
    { name: "Charlotte F.", country: "Australia", flag: "🇦🇺" },
    { name: "Jack N.", country: "Australia", flag: "🇦🇺" },

    // Mexico (10 names)
    { name: "Diego M.", country: "Mexico", flag: "🇲🇽" },
    { name: "Sofia R.", country: "Mexico", flag: "🇲🇽" },
    { name: "Miguel A.", country: "Mexico", flag: "🇲🇽" },
    { name: "Valentina G.", country: "Mexico", flag: "🇲🇽" },
    { name: "Alejandro P.", country: "Mexico", flag: "🇲🇽" },
    { name: "Camila L.", country: "Mexico", flag: "🇲🇽" },
    { name: "Luis K.", country: "Mexico", flag: "🇲🇽" },
    { name: "Isabella T.", country: "Mexico", flag: "🇲🇽" },
    { name: "Jose V.", country: "Mexico", flag: "🇲🇽" },
    { name: "Fernanda D.", country: "Mexico", flag: "🇲🇽" },

    // Italy (10 names)
    { name: "Isabella R.", country: "Italy", flag: "🇮🇹" },
    { name: "Marco V.", country: "Italy", flag: "🇮🇹" },
    { name: "Giulia B.", country: "Italy", flag: "🇮🇹" },
    { name: "Alessandro F.", country: "Italy", flag: "🇮🇹" },
    { name: "Sofia M.", country: "Italy", flag: "🇮🇹" },
    { name: "Lorenzo D.", country: "Italy", flag: "🇮🇹" },
    { name: "Francesca G.", country: "Italy", flag: "🇮🇹" },
    { name: "Matteo H.", country: "Italy", flag: "🇮🇳" },
    { name: "Chiara L.", country: "Italy", flag: "🇮🇹" },
    { name: "Andrea P.", country: "Italy", flag: "🇮🇹" },

    // Spain (8 names)
    { name: "Maria C.", country: "Spain", flag: "🇪🇸" },
    { name: "Carlos L.", country: "Spain", flag: "🇪🇸" },
    { name: "Elena M.", country: "Spain", flag: "🇪🇸" },
    { name: "Javier R.", country: "Spain", flag: "🇪🇸" },
    { name: "Laura F.", country: "Spain", flag: "🇪🇸" },
    { name: "David N.", country: "Spain", flag: "🇪🇸" },
    { name: "Ana G.", country: "Spain", flag: "🇪🇸" },
    { name: "Pablo V.", country: "Spain", flag: "🇪🇸" },

    // Netherlands (6 names)
    { name: "Lars K.", country: "Netherlands", flag: "🇳🇱" },
    { name: "Emma V.", country: "Netherlands", flag: "🇳🇱" },
    { name: "Daan B.", country: "Netherlands", flag: "🇳🇱" },
    { name: "Sophie R.", country: "Netherlands", flag: "🇳🇱" },
    { name: "Thijs M.", country: "Netherlands", flag: "🇳🇱" },
    { name: "Lisa D.", country: "Netherlands", flag: "🇳🇱" },

    // Canada (8 names)
    { name: "Ryan M.", country: "Canada", flag: "🇨🇦" },
    { name: "Emily T.", country: "Canada", flag: "🇨🇦" },
    { name: "Jacob W.", country: "Canada", flag: "🇨🇦" },
    { name: "Hannah L.", country: "Canada", flag: "🇨🇦" },
    { name: "Liam K.", country: "Canada", flag: "🇨🇦" },
    { name: "Sophia R.", country: "Canada", flag: "🇨🇦" },
    { name: "Ethan P.", country: "Canada", flag: "🇨🇦" },
    { name: "Olivia B.", country: "Canada", flag: "🇨🇦" },

    // South Korea (6 names)
    { name: "Min-Jun K.", country: "South Korea", flag: "🇰🇷" },
    { name: "Seo-Yun L.", country: "South Korea", flag: "🇰🇷" },
    { name: "Ji-Hoon P.", country: "South Korea", flag: "🇰🇷" },
    { name: "Hye-Jin C.", country: "South Korea", flag: "🇰🇷" },
    { name: "Tae-Yang M.", country: "South Korea", flag: "🇰🇷" },
    { name: "Eun-Ji W.", country: "South Korea", flag: "🇰🇷" },

    // Singapore (6 names)
    { name: "Wei Ting", country: "Singapore", flag: "🇸🇬" },
    { name: "Kai En", country: "Singapore", flag: "🇸🇬" },
    { name: "Li Hua", country: "Singapore", flag: "🇸🇬" },
    { name: "Siti A.", country: "Singapore", flag: "🇸🇬" },
    { name: "Arjun T.", country: "Singapore", flag: "🇸🇬" },
    { name: "Priya M.", country: "Singapore", flag: "🇸🇬" },
];

// Daily rotation with 3-day cooldown system
const getDailySeed = () => {
    const today = new Date();
    // Change seed daily (not every 2 days)
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    return daysSinceEpoch;
};

// Seeded random number generator
const seededRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

// Fisher-Yates shuffle with seed
const shuffleWithSeed = (array: any[], seed: number) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Get daily unique subset (60-80 names) that haven't been used in last 2 days
const getDailyNames = () => {
    const currentDay = getDailySeed();

    // Get 3 different shuffles for 3-day rotation
    const day0Shuffle = shuffleWithSeed(DEMO_NAMES, currentDay);
    const day1Shuffle = shuffleWithSeed(DEMO_NAMES, currentDay - 1);
    const day2Shuffle = shuffleWithSeed(DEMO_NAMES, currentDay - 2);

    // Get names used in last 2 days
    const recentlyUsed = new Set([
        ...day1Shuffle.slice(0, 70).map(n => n.name),
        ...day2Shuffle.slice(0, 70).map(n => n.name),
    ]);

    // Filter out recently used names from today's pool
    const availableNames = day0Shuffle.filter(person => !recentlyUsed.has(person.name));

    // If we have enough unique names (60+), use them
    // Otherwise fall back to using all available (this handles edge cases)
    const dailyPool = availableNames.length >= 60 ? availableNames.slice(0, 75) : availableNames;

    return dailyPool;
};

// Generate random payout data using daily unique pool
const generateRandomPayouts = (count: number): PayoutItem[] => {
    const dailyNames = getDailyNames();
    const payouts: PayoutItem[] = [];

    for (let i = 0; i < count; i++) {
        // Use daily pool, cycling if needed (shouldn't happen with 75 names and 12 showing)
        const person = dailyNames[i % dailyNames.length];
        const randomAmount = Math.floor(Math.random() * 400) + 50; // $50-$450

        payouts.push({
            id: `payout-${i}-${Date.now()}-${Math.random()}`,
            name: person.name,
            amount: randomAmount,
            country: person.country,
            countryFlag: person.flag,
        });
    }
    return payouts;
};

export default function RecentPayoutsCard() {
    const [payouts, setPayouts] = useState<PayoutItem[]>([]);

    useEffect(() => {
        // Generate initial payouts - need enough for seamless loop
        const initialPayouts = generateRandomPayouts(12);
        setPayouts(initialPayouts);
    }, []);

    // Duplicate payouts for infinite scroll effect
    const duplicatedPayouts = [...payouts, ...payouts];

    return (
        <div
            className="relative overflow-hidden rounded-[2rem] p-6 border"
            style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(192, 132, 252, 0.08))',
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1)',
            }}
        >
            {/* Animated glow effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl animate-pulse-slow"
                    style={{ background: 'rgba(139, 92, 246, 0.4)' }}
                />
                <div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl animate-pulse-slow"
                    style={{ background: 'rgba(192, 132, 252, 0.3)', animationDelay: '1s' }}
                />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-bold text-white">Recent Payouts</h3>
                        <p className="text-xs text-white/50">Live withdrawal activity</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span
                            className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
                            style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)' }}
                        />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live</span>
                    </div>
                </div>
            </div>

            {/* Continuous scrolling payouts container */}
            <div
                className="relative z-10 overflow-hidden"
                style={{ height: '200px' }}
            >
                {/* Scrolling wrapper with duplicated content for infinite loop */}
                <div className="scroll-container">
                    {duplicatedPayouts.map((payout, index) => (
                        <div
                            key={`${payout.id}-${index}`}
                            className="mb-2"
                        >
                            <div
                                className="flex items-center justify-between p-3 rounded-xl border border-white/5 transition-all duration-300 hover:bg-white/5 hover:border-purple-500/30"
                                style={{
                                    background: index % 2 === 0
                                        ? 'rgba(255, 255, 255, 0.02)'
                                        : 'rgba(139, 92, 246, 0.05)',
                                }}
                            >
                                {/* Flag and Name */}
                                <div className="flex items-center gap-3 flex-1">
                                    <span
                                        className="text-2xl"
                                        style={{
                                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                                        }}
                                    >
                                        {payout.countryFlag}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white">
                                            {payout.name}
                                        </span>
                                        <span className="text-[10px] text-white/40">
                                            {payout.country}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div
                                    className="text-sm font-bold"
                                    style={{
                                        color: '#10B981',
                                        textShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                                    }}
                                >
                                    +${payout.amount.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gradient fade overlay at top and bottom */}
                <div
                    className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-10"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(30, 20, 43, 1), rgba(30, 20, 43, 0.8), transparent)'
                    }}
                />
                <div
                    className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10"
                    style={{
                        background: 'linear-gradient(to top, rgba(30, 20, 43, 1), rgba(30, 20, 43, 0.8), transparent)'
                    }}
                />
            </div>

            {/* Custom animations */}
            <style jsx>{`
                @keyframes continuousScroll {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-50%);
                    }
                }

                @keyframes pulseSlow {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .scroll-container {
                    animation: continuousScroll 20s linear infinite;
                    will-change: transform;
                }

                .scroll-container:hover {
                    animation-play-state: paused;
                }

                .animate-pulse-slow {
                    animation: pulseSlow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
