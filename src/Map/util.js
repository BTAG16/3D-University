import listingsGeojson from '../data/university_buildings.js'

export const getFeatures = () => {
  // Image paths should be relative to the public folder
  // Since these images are in public/img/, they should be referenced as /img/
  const images = [
    '/img/F-Building.png', 
    '/img/A-Building.jpeg',
    '/img/I-Building.avif',
    '/img/M-Building.jpg', 
    '/img/P-Building.png', 
    '/img/F-Building.png',
    '/img/L-Building.jpg', 
    '/img/H-Building.webp',
  ]

  return listingsGeojson.features.map((d, i) => {
    // Assign the corresponding image, fallback to first image if more features are added
    d.properties.imageUrl = images[i] || images[0]
    return d
  })
}