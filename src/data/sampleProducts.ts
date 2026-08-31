import { ProductProfile } from '../types';

export const SAMPLE_PRODUCTS: ProductProfile[] = [
  {
    id: 'prod-jute-bag',
    name: 'Handmade Jute Bag',
    category: 'Handicrafts / Eco-bags',
    material: 'Natural Golden Jute',
    isHandmade: true,
    quantity: 50,
    price: 600,
    costMaterial: 200,
    costLabor: 300,
    dimensions: '35×25×5 cm',
    weight: '450g',
    description: 'Eco-friendly, hand-woven golden jute tote bag with reinforced handles. Durable, sustainable, and crafted with traditional weaving techniques.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLH6bRHq3rAzbbw3XPl3p803tF261Tvc8ol4La8t7dSft3VZutPHGe9J-nPrYYx-JVD22O_RcoavEYQb4obS4iU8sk8s3ssvzimuRORmK7WSDZoWodBA8HeSR-PAxQ7-Nctr4-F9cfEBimlGD0g1-JhHTFSKZW8Gkc5_53DQEXWlbFeY4PvcksipcoZFBPyhsD8LZiQii1TdXhHSwaMM---qxUAbFN5GUEgqmDYWM6a9P8y3VCqe54',
    tags: ['Eco-friendly', 'Handmade', 'Jute', 'Sustainable', 'Artisan'],
    location: 'Madurai, Tamil Nadu',
    status: 'ready',
    createdAt: 'Today, 10:30 AM'
  },
  {
    id: 'prod-ceramic-bowls',
    name: 'Ceramic Bowls (Set of 3)',
    category: 'Pottery & Ceramics',
    material: 'Terracotta Clay',
    isHandmade: true,
    quantity: 25,
    price: 1200,
    costMaterial: 350,
    costLabor: 600,
    dimensions: '20×20×8 cm',
    weight: '900g',
    description: 'Hand-thrown terracotta ceramic bowls finished with lead-free organic mineral glaze. Perfect for dining and serving.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnf4GBz88dANB74zko69c7yC2T944vVMeJeSB0o8yT2AFvV79GnGR5Sj5ldDuWe7hUt_IYyUPUSPO5Q-w9BPJ0turs6EJZjgn5PMAkxLNLYbVob87IzqKUwgCMWvJ0Njpu-etMh63TED766_eCe47Q9N1QoWIa-UzdWqsNuA6J5O5IC2uvImSZ11UuaUmHeIncldC9NPb2lDLNW4GFjp0CHurU7jMchYlJG6F0WJ__4xHUKZR1J9Q4',
    tags: ['Pottery', 'Clay', 'Handmade', 'Dining'],
    location: 'Kutch, Gujarat',
    status: 'ready',
    createdAt: 'Yesterday'
  },
  {
    id: 'prod-handloom-stole',
    name: 'Handloom Cotton Stole',
    category: 'Textiles & Apparel',
    material: '100% Organic Cotton',
    isHandmade: true,
    quantity: 40,
    price: 850,
    costMaterial: 250,
    costLabor: 400,
    dimensions: '200×60 cm',
    weight: '180g',
    description: 'Soft, breathable hand-spun cotton stole woven on traditional pit-looms using plant-based natural dyes.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFwmZn4jxvsq0zCaYh4nKZDiyqkaoQiUVIm3bLmF8ycmazyvWkD7aHblfNf-acLqooLgaN84x2ldUcT-9lMQNKxlQbxQZyfiBcIWTFVu8BfOHtMb3UzzwiFCENqzbQhaykywc2VwejFjwlAwiIyruBdbRl26PnTDSbYmo-qyeK9CpyHHkhOfC8jIW8227d360vUnqliPRbukmit0MZoQEzGbJG922WR_MEaEJuLBfM0_Asp3YYnaxo',
    tags: ['Handloom', 'Cotton', 'Organic', 'Textile'],
    location: 'Madurai, Tamil Nadu',
    status: 'ready',
    createdAt: '3 days ago'
  }
];

export const DEMO_PHOTO_OPTIONS = [
  {
    name: 'Jute Bag',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLH6bRHq3rAzbbw3XPl3p803tF261Tvc8ol4La8t7dSft3VZutPHGe9J-nPrYYx-JVD22O_RcoavEYQb4obS4iU8sk8s3ssvzimuRORmK7WSDZoWodBA8HeSR-PAxQ7-Nctr4-F9cfEBimlGD0g1-JhHTFSKZW8Gkc5_53DQEXWlbFeY4PvcksipcoZFBPyhsD8LZiQii1TdXhHSwaMM---qxUAbFN5GUEgqmDYWM6a9P8y3VCqe54',
    detectedTitle: 'Handmade Jute Bag',
    material: 'Natural Golden Jute',
    price: 600,
    costMaterial: 200,
    costLabor: 300,
    dimensions: '35×25×5 cm',
    weight: '450g',
    question: 'Is this a jute bag?',
    questionHi: 'क्या यह जूट का बैग है?',
    questionTa: 'இது சணல் பையா?'
  },
  {
    name: 'Ceramic Bowls',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnf4GBz88dANB74zko69c7yC2T944vVMeJeSB0o8yT2AFvV79GnGR5Sj5ldDuWe7hUt_IYyUPUSPO5Q-w9BPJ0turs6EJZjgn5PMAkxLNLYbVob87IzqKUwgCMWvJ0Njpu-etMh63TED766_eCe47Q9N1QoWIa-UzdWqsNuA6J5O5IC2uvImSZ11UuaUmHeIncldC9NPb2lDLNW4GFjp0CHurU7jMchYlJG6F0WJ__4xHUKZR1J9Q4',
    detectedTitle: 'Ceramic Bowls',
    material: 'Terracotta Clay',
    price: 1200,
    costMaterial: 350,
    costLabor: 600,
    dimensions: '20×20×8 cm',
    weight: '900g',
    question: 'Are these ceramic bowls?',
    questionHi: 'क्या यह मिट्टी के बर्तन हैं?',
    questionTa: 'இது மண்பாண்ட கிண்ணங்களா?'
  },
  {
    name: 'Cotton Stole',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFwmZn4jxvsq0zCaYh4nKZDiyqkaoQiUVIm3bLmF8ycmazyvWkD7aHblfNf-acLqooLgaN84x2ldUcT-9lMQNKxlQbxQZyfiBcIWTFVu8BfOHtMb3UzzwiFCENqzbQhaykywc2VwejFjwlAwiIyruBdbRl26PnTDSbYmo-qyeK9CpyHHkhOfC8jIW8227d360vUnqliPRbukmit0MZoQEzGbJG922WR_MEaEJuLBfM0_Asp3YYnaxo',
    detectedTitle: 'Handloom Cotton Stole',
    material: '100% Organic Cotton',
    price: 850,
    costMaterial: 250,
    costLabor: 400,
    dimensions: '200×60 cm',
    weight: '180g',
    question: 'Is this a handloom stole?',
    questionHi: 'क्या यह हथकरघा दुपट्टा है?',
    questionTa: 'இது கைத்தறி துப்பட்டாவா?'
  }
];
