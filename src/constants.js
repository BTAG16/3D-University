import { Map, Compass, Smartphone, Building, BarChart3, Share2, Globe, Shield, Zap } from 'lucide-react';
// import {Testimonial} from './types';

export const FEATURES = [
  {
    id: '1',
    title: 'Interactive 3D Maps',
    description: 'High-fidelity isometric rendering of your entire campus with dynamic lighting.',
    icon: Map,
    color: '#c084fc' // purple-400
  },
  {
    id: '2',
    title: 'Smart Navigation',
    description: 'Turn-by-turn directions with accessible routes for everyone.',
    icon: Compass,
    color: '#22d3ee' // cyan-400
  },
  {
    id: '3',
    title: 'Mobile-First Design',
    description: 'Optimized experience for students on the go, no app download needed.',
    icon: Smartphone,
    color: '#f472b6' // pink-400
  },
  {
    id: '4',
    title: 'Building Details',
    description: 'Rich metadata for every room, office hours, and amenities.',
    icon: Building,
    color: '#facc15' // yellow-400
  },
  {
    id: '5',
    title: 'Analytics Dashboard',
    description: 'Understand traffic flow and popular search destinations.',
    icon: BarChart3,
    color: '#4ade80' // green-400
  },
  {
    id: '6',
    title: 'Easy Integration',
    description: 'Embeds seamlessly into your existing university portal.',
    icon: Share2,
    color: '#60a5fa' // blue-400
  }
];

export const STATS = [
  { id: '1', value: '500', label: 'Universities', suffix: '+' },
  { id: '2', value: '100', label: 'Buildings Mapped', suffix: 'K+' },
  { id: '3', value: '5', label: 'Students Helped', suffix: 'M+' },
  { id: '4', value: '99.9', label: 'Uptime', suffix: '%' },
];

export const TESTIMONIALS = [
  {
    id: '1',
    content: "Campus Explorer completely transformed how our freshmen navigate orientation week. It's indispensable.",
    author: "Dr. Sarah Chen",
    role: "Dean of Student Affairs",
    university: "Stanford University",
    avatar: "https://picsum.photos/100/100?random=1"
  },
  {
    id: '2',
    content: "The 3D implementation is stunning. It feels like a high-end video game but runs smoothly in the browser.",
    author: "Marcus Johnson",
    role: "Director of Facilities",
    university: "MIT",
    avatar: "https://picsum.photos/100/100?random=2"
  },
  {
    id: '3',
    content: "Finally, a mapping solution that actually understands accessibility. The accessible routing is a game changer.",
    author: "Emily Rodriguez",
    role: "Accessibility Coordinator",
    university: "UCLA",
    avatar: "https://picsum.photos/100/100?random=3"
  }
];

export const PRICING = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small campuses or single buildings.",
    features: ["Up to 5 Buildings", "Basic 2D Maps", "Standard Support", "Mobile Responsive"],
    recommended: false
  },
  {
    name: "Pro",
    price: "$499",
    description: "The complete solution for modern universities.",
    features: ["Unlimited Buildings", "Interactive 3D Maps", "Room-level Search", "Analytics Dashboard", "Priority Support"],
    recommended: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large university systems and custom needs.",
    features: ["Multi-campus Support", "SSO Integration", "Custom API Access", "Dedicated Success Manager", "SLA Guarantee"],
    recommended: false
  }
];