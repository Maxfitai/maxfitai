export interface Video {
  id: string
  title: string
  thumbnail: string | null
  duration: string
  views: string
  url?: string
  contentType?: string
}

export interface Exercise {
  name: string
  sets?: number
  reps?: string
  duration?: string
  rest?: string
  notes?: string
}

export interface Workout {
  day: string
  exercises: Exercise[]
}

export interface Meal {
  mealType: string
  description: string
}

export interface Nutrition {
  calories?: string
  protein?: string
  carbs?: string
  fats?: string
  meals: Meal[]
}

export interface Plan {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly'
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  price: number
  workouts: Workout[]
  nutrition: Nutrition | null
  tags: string[]
}

export interface Coach {
  id: string
  name: string
  role: string
  experience: string
  image: string
  rating: number
  reviews: number
  bio: string
  specializations: string[]
  achievements: string[]
  videos: Video[]
  plans?: Plan[]
  pricePerSession?: number | null
  availability: string
  verified: boolean
  calendlyUrl: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
  }
}

export const coaches: Coach[] = [
  // {
  //     id: '1',
  //     name: 'Dr Jad Bakir',
  //     role: 'High experience with fitness',
  //     experience: '8+ Years',
  //     image: '/Coach/DrJad.jpeg',
  //     rating: 4.9,
  //     reviews: 124,
  //     bio: 'Sarah specializes in high-intensity interval training and strength conditioning. With a background in competitive athletics, she helps clients push past their limits and achieve peak performance.',
  //     specializations: ['HIIT', 'Strength Training', 'Athletic Conditioning'],
  //     achievements: [
  //         'Certified Personal Trainer (NASM)',
  //         'CrossFit Level 2 Trainer',
  //         'Former Olympic Weightlifting Competitor'
  //     ],
  //     pricePerSession: 85,
  //     availability: 'Mon - Fri, 6AM - 2PM',
  //     videos: [
  //         {
  //             id: 'v1',
  //             title: '15 Min Full Body HIIT',
  //             thumbnail: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1000&auto=format&fit=crop',
  //             duration: '15:00',
  //             views: '1.2k'
  //         },
  //         {
  //             id: 'v2',
  //             title: 'Core Strength Fundamentals',
  //             thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop',
  //             duration: '22:30',
  //             views: '850'
  //         }
  //     ],
  //     socialLinks: {
  //         facebook: 'https://facebook.com/_dr.jad',
  //         instagram: 'https://instagram.com/_dr.jad',
  //         twitter: 'https://twitter.com/drjadbakir',
  //         linkedin: 'https://linkedin.com/in/drjadbakir',
  //         youtube: 'https://youtube.com/drjadbakir',
  //         tiktok: 'https://tiktok.com/@drjadbakir'
  //     },
  // },
  {
    id: '1',
    name: 'Alex Rodriguez',
    role: 'Functional Fitness Coach',
    experience: '10+ Years',
    image: '/Coach/Alex.jpeg',
    rating: 4.9,
    reviews: 189,
    bio: 'Alex specializes in functional training and sports performance. With a decade of experience working with professional athletes and fitness enthusiasts, he creates comprehensive programs that enhance strength, agility, and endurance.',
    specializations: ['Training', 'Sports Performance', 'Mobility Work'],
    achievements: [
      'Certified Strength & Conditioning Specialist (CSCS)',
      'USA Weightlifting Level 2 Coach',
      'TRX Master Instructor',
    ],
    pricePerSession: 95,
    availability: 'Mon - Fri, 7AM - 3PM',
    verified: true,
    calendlyUrl: 'https://calendly.com/786alidev/30min',
    videos: [
      {
        id: 'v1',
        title: 'Functional Movement Patterns',
        thumbnail:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
        duration: '18:30',
        views: '2.1k',
      },
      {
        id: 'v2',
        title: 'Athletic Conditioning Drills',
        thumbnail:
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
        duration: '25:15',
        views: '1.8k',
      },
    ],
    socialLinks: {
      facebook: 'https://facebook.com/alexrodriguezfit',
      instagram: 'https://instagram.com/alexrodriguezfit',
      twitter: 'https://twitter.com/alexrodriguezfit',
      linkedin: 'https://linkedin.com/in/alexrodriguezfit',
      youtube: 'https://youtube.com/alexrodriguezfit',
      tiktok: 'https://tiktok.com/@alexrodriguezfit',
    },
  },
  {
    id: '2',
    name: 'Anas Fouad',
    role: 'Bodybuilding & Nutrition Expert',
    experience: '12+ Years',
    image: '/Coach/anas.png',
    rating: 5.0,
    reviews: 215,
    bio: 'Marcus combines old-school bodybuilding techniques with modern nutritional science. He has helped hundreds of clients transform their physiques through disciplined training and customized meal planning.',
    specializations: ['Hypertrophy', 'Nutrition Planning', 'Contest Prep'],
    achievements: [
      'IFBB Pro Card Holder',
      'Certified Sports Nutritionist (ISSN)',
      "Men's Physique Champion 2019",
    ],
    pricePerSession: 120,
    availability: 'Tue - Sat, 10AM - 6PM',
    verified: true,
    calendlyUrl: 'https://calendly.com/786alidev/30min',

    videos: [
      {
        id: 'v3',
        title: 'Chest & Triceps Mass Builder',
        thumbnail:
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop',
        duration: '45:00',
        views: '5.4k',
      },
      {
        id: 'v4',
        title: 'Meal Prep for Gains',
        thumbnail:
          'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000&auto=format&fit=crop',
        duration: '12:45',
        views: '3.1k',
      },
    ],
    socialLinks: {
      instagram: 'https://www.instagram.com/anas__fouadd',
      youtube: 'https://youtube.com/anasfitness',
      facebook: 'https://facebook.com/anasfitness',
      tiktok: 'https://www.tiktok.com/@anasfouadd',
      twitter: 'https://twitter.com/anasfitness',
      linkedin: 'https://linkedin.com/in/anasfitness',
    },
  },
  {
    id: '3',
    name: 'Melody',
    role: 'Yoga & Mobility Specialist',
    experience: '6+ Years',
    image: '/Coach/Melody.png',
    rating: 4.8,
    reviews: 98,
    bio: 'Elena focuses on functional movement, flexibility, and mental well-being. Her sessions are designed to improve range of motion, reduce injury risk, and promote mindfulness through yoga flow.',
    specializations: ['Vinyasa Yoga', 'Mobility Work', 'Injury Prevention'],
    achievements: [
      'RYT 500 Yoga Alliance Certified',
      'Functional Range Conditioning (FRC) Specialist',
      'Mindfulness Based Stress Reduction Certified',
    ],
    pricePerSession: 70,
    availability: 'Mon, Wed, Fri, Sun',
    verified: true,
    calendlyUrl: 'https://calendly.com/786alidev/30min',

    videos: [
      {
        id: 'v5',
        title: 'Morning Mobility Routine',
        thumbnail:
          'https://images.unsplash.com/photo-1544367563-12123d896889?q=80&w=1000&auto=format&fit=crop',
        duration: '20:00',
        views: '2.8k',
      },
      {
        id: 'v6',
        title: 'Yoga for Recovery',
        thumbnail:
          'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1000&auto=format&fit=crop',
        duration: '35:00',
        views: '1.5k',
      },
    ],
    socialLinks: {
      instagram: 'https://www.instagram.com/melodyivase',
      facebook: 'https://facebook.com/melodyyoga',
      twitter: 'https://twitter.com/melodyyoga',
      linkedin: 'https://linkedin.com/in/melodyyoga',
      youtube: 'https://youtube.com/melodyyoga',
      tiktok: 'https://tiktok.com/@melodyyoga',
    },
  },
]
