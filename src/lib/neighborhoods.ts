export interface Neighborhood {
  slug: string;
  name: string;
  headline: string;
  description: string;
  highlights: string[];
  avgPrice: string;
  priceRange: string;
  homeTypes: string[];
  schools: string[];
  nearbyAmenities: string[];
  sellerInsight: string;
  image: string;
  mapQuery: string;
}

export const neighborhoods: Neighborhood[] = [
  {
    slug: 'old-oakville',
    name: 'Old Oakville',
    headline: 'Sell Your Home in Old Oakville — Heritage Charm Meets Premium Value',
    description:
      'Old Oakville is one of the most sought-after neighbourhoods in the GTA. Tree-lined streets, heritage homes, and walkability to Lakeshore Road and the waterfront make this a perennial favourite for buyers willing to pay a premium. Sellers here benefit from high demand, low inventory, and emotional buyer attachment to the neighbourhood\'s character.',
    highlights: [
      'Walk to Lakeshore Road shops, restaurants, and the lakefront',
      'Heritage architecture with mature trees and deep lots',
      'Top-rated schools including New Central Public School',
      'Strong demand from move-up buyers and empty nesters',
    ],
    avgPrice: '$2.1M',
    priceRange: '$1.2M – $5M+',
    homeTypes: ['Detached', 'Semi-Detached', 'Heritage Homes', 'Custom Builds'],
    schools: ['New Central Public School', 'Appleby College', 'Elementary School Catholic Sainte-Marie'],
    nearbyAmenities: ['Lakeshore Road', 'Oakville Harbour', 'Centennial Square', 'Oakville GO Station'],
    sellerInsight:
      'Homes in Old Oakville sell fastest when they balance heritage character with modern updates. Buyers here are willing to pay a significant premium for move-in-ready properties with updated kitchens and bathrooms while preserving original architectural details.',
    image: '/neighbourhoods/old-oakville.jpg',
    mapQuery: 'Old Oakville, Ontario',
  },
  {
    slug: 'bronte',
    name: 'Bronte',
    headline: 'Sell Your Home in Bronte — Lakeside Village Living at Its Best',
    description:
      'Bronte offers a unique village atmosphere with its charming harbour, independent shops, and tight-knit community feel. This lakeside neighbourhood consistently attracts buyers who want a quieter pace without sacrificing access to amenities. Sellers benefit from Bronte\'s strong emotional pull and limited housing supply.',
    highlights: [
      'Bronte Harbour and waterfront parks',
      'Charming village core with local shops and restaurants',
      'Excellent schools including St. Dominic Catholic School',
      'Proximity to Bronte Creek Provincial Park',
    ],
    avgPrice: '$1.6M',
    priceRange: '$900K – $3.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse', 'Condo'],
    schools: ['St. Dominic Catholic School', 'Blakelock High School', 'St. Joseph Catholic Elementary School'],
    nearbyAmenities: ['Bronte Harbour', 'Bronte Creek Provincial Park', 'Bronte Village Mall', 'Coronation Park'],
    sellerInsight:
      'Bronte buyers are often families moving from Toronto or Milton looking for community feel with lake access. Staging your outdoor spaces and highlighting walkability to the harbour can add significant perceived value to your listing.',
    image: '/neighbourhoods/bronte.jpg',
    mapQuery: 'Bronte, Oakville, Ontario',
  },
  {
    slug: 'glen-abbey',
    name: 'Glen Abbey',
    headline: 'Sell Your Home in Glen Abbey — Golf Course Living & Family Appeal',
    description:
      'Glen Abbey is synonymous with the famous golf course and upscale family living. This established neighbourhood features generous lot sizes, excellent schools, and a strong community identity. It\'s a top pick for families relocating to Oakville, making it one of the most liquid markets in town for sellers.',
    highlights: [
      'Home of the iconic Glen Abbey Golf Course',
      'Large lots with mature landscaping',
      'Top-ranked schools and family-friendly community',
      'Minutes from QEW and major shopping at Upper Oakville Shopping Centre',
    ],
    avgPrice: '$1.8M',
    priceRange: '$1.1M – $4M+',
    homeTypes: ['Detached', 'Executive Homes', 'Estate Properties'],
    schools: ['Abbey Park High School', 'Pilgrim Wood Public School', 'St. Matthew Catholic Elementary School'],
    nearbyAmenities: ['Glen Abbey Golf Course', 'Upper Oakville Shopping Centre', 'Glen Abbey Recreation Centre', 'Sixteen Mile Creek trails'],
    sellerInsight:
      'Glen Abbey homes sell best when marketed to families relocating from Toronto. Highlight school rankings, proximity to the golf course, and the neighbourhood\'s established reputation. Properties near the ravine lots command the highest premiums.',
    image: '/neighbourhoods/glen-abbey.jpg',
    mapQuery: 'Glen Abbey, Oakville, Ontario',
  },
  {
    slug: 'river-oaks',
    name: 'River Oaks',
    headline: 'Sell Your Home in River Oaks — Modern Family Living in North Oakville',
    description:
      'River Oaks is a newer, master-planned community in North Oakville that has rapidly become one of the most popular neighbourhoods for young families. Modern homes, excellent schools, and abundant green space make it highly attractive to buyers. Sellers here benefit from consistent demand and a large pool of first-time and move-up buyers.',
    highlights: [
      'Modern homes built in the 2000s-2020s',
      'Extensive trail network and parks',
      'Highly rated new schools',
      'Easy access to 403/407 highways',
    ],
    avgPrice: '$1.4M',
    priceRange: '$800K – $2.2M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse', 'Stacked Townhouse'],
    schools: ['River Oaks Public School', 'Holy Trinity Catholic Secondary School', 'Rotherglen School'],
    nearbyAmenities: ['River Oaks Community Centre', 'Sixteen Mile Sports Complex', 'North Park', 'SmartCentres Oakville'],
    sellerInsight:
      'River Oaks attracts a younger demographic — many buyers are upgrading from condos or first homes in Mississauga and Burlington. Modern finishes and open-concept layouts are expected, so invest in cosmetic updates if your home has dated fixtures.',
    image: '/neighbourhoods/river-oaks.jpg',
    mapQuery: 'River Oaks, Oakville, Ontario',
  },
  {
    slug: 'west-oak-trails',
    name: 'West Oak Trails',
    headline: 'Sell Your Home in West Oak Trails — Oakville\'s Best-Kept Secret',
    description:
      'West Oak Trails offers a fantastic balance of value and livability in North Oakville. With a mix of home styles, excellent parks, and strong schools, it appeals to a wide range of buyers. Sellers in this area benefit from relatively high turnover and strong buyer interest from families priced out of South Oakville.',
    highlights: [
      'Diverse housing stock at various price points',
      'Beautiful trail systems and green spaces',
      'Strong school ratings',
      'Close to Oakville Place and major retail',
    ],
    avgPrice: '$1.3M',
    priceRange: '$750K – $2M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse', 'Condo'],
    schools: ['West Oak Public School', 'St. Joan of Arc Catholic School', 'Garth Webb Secondary School'],
    nearbyAmenities: ['West Oak Trails Community Centre', 'Oakville Place Mall', 'Neyagawa Boulevard trails', 'Sixteen Mile Creek'],
    sellerInsight:
      'West Oak Trails is where many first-time Oakville buyers start their search. Price competitively and you\'ll often see multiple offers. Highlight proximity to trails and the community centre — these are major selling points for young families.',
    image: '/neighbourhoods/westoak-trails.jpg',
    mapQuery: 'West Oak Trails, Oakville, Ontario',
  },
  {
    slug: 'eastlake',
    name: 'Eastlake',
    headline: 'Sell Your Home in Eastlake — Established Elegance Near the Lake',
    description:
      'Eastlake is a mature, well-established South Oakville neighbourhood known for its proximity to the lake, excellent schools, and tree-lined streets. Properties here are highly desirable, with a mix of original homes and tasteful renovations. Sellers can command strong prices, especially for updated properties on larger lots.',
    highlights: [
      'South Oakville lakeside location',
      'Mature trees and established streetscapes',
      'Walking distance to Oakville GO and downtown',
      'Highly ranked public and Catholic schools',
    ],
    avgPrice: '$1.7M',
    priceRange: '$1M – $3.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Bungalows', 'Custom Renovations'],
    schools: ['E.J. James Public School', 'St. Vincent Catholic Elementary School', 'Linbrook School'],
    nearbyAmenities: ['Oakville GO Station', 'Downtown Oakville', 'Gairloch Gardens', 'Oakville Museum'],
    sellerInsight:
      'Eastlake buyers value the walkable lifestyle and proximity to the GO train. If your home has been renovated, make sure to document all upgrades — buyers here pay premiums for quality renovations that respect the neighbourhood\'s character.',
    image: '/neighbourhoods/east-lake.jpg',
    mapQuery: 'Eastlake, Oakville, Ontario',
  },
  {
    slug: 'college-park',
    name: 'College Park',
    headline: 'Sell Your Home in College Park — Central Oakville Convenience',
    description:
      'College Park sits in the heart of Oakville, offering unmatched convenience with its central location near Sheridan College, Oakville Place, and major transit routes. The neighbourhood features a mix of housing styles from condos to detached homes, making it accessible to a broad range of buyers.',
    highlights: [
      'Central location near Sheridan College',
      'Steps from Oakville Place shopping',
      'Excellent transit connections',
      'Diverse housing options at various price points',
    ],
    avgPrice: '$1.1M',
    priceRange: '$500K – $1.8M',
    homeTypes: ['Detached', 'Townhouse', 'Condo', 'Semi-Detached'],
    schools: ['White Oaks Secondary School', 'Sunningdale Public School', 'Gaétan-Gervais Secondary School'],
    nearbyAmenities: ['Sheridan College', 'Oakville Place', 'Oakville Transit Hub', 'QEW Access'],
    sellerInsight:
      'College Park attracts first-time buyers, investors, and downsizers. The condo market here is strong thanks to proximity to Sheridan College. If you\'re selling a detached home, price it right and you\'ll attract families who can\'t afford South Oakville but want central convenience.',
    image: '/neighbourhoods/college-park.jpg',
    mapQuery: 'College Park, Oakville, Ontario',
  },
  {
    slug: 'morrison',
    name: 'Morrison',
    headline: 'Sell Your Home in Morrison — South Oakville\'s Hidden Gem',
    description:
      'Morrison is a quiet, residential neighbourhood in South Oakville that offers excellent value compared to neighbouring Old Oakville and Eastlake. With good schools, mature lots, and easy access to both the QEW and Oakville GO, it\'s increasingly attracting buyers looking for South Oakville living at a more accessible price point.',
    highlights: [
      'South Oakville location at accessible prices',
      'Quiet, family-friendly streets',
      'Easy access to QEW and Oakville GO',
      'Proximity to South Oakville amenities',
    ],
    avgPrice: '$1.4M',
    priceRange: '$900K – $2.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Bungalows', 'Backsplit'],
    schools: ['St. Mildred\'s-Lightbourn School', 'Maple Grove Public School', 'Oakville Trafalgar High School'],
    nearbyAmenities: ['Coronation Park', 'Shell Park', 'South Oakville Centre', 'Oakville GO Station'],
    sellerInsight:
      'Morrison is gaining momentum as South Oakville buyers seek alternatives to Old Oakville prices. Position your listing as "South Oakville value" and highlight the neighbourhood\'s proximity to the lake, GO train, and established amenities.',
    image: '/neighbourhoods/clearview.jpg',
    mapQuery: 'Morrison, Oakville, Ontario',
  },
  {
    slug: 'palermo',
    name: 'Palermo',
    headline: 'Sell Your Home in Palermo — Space, Privacy & Rural Charm',
    description:
      'Palermo sits on Oakville\'s northern edge, offering larger lots, more privacy, and a semi-rural feel that\'s increasingly rare in the GTA. This area appeals to buyers who want space — whether for a growing family, home office, or hobby farm. Sellers with acreage or estate-style properties can attract a premium buyer pool.',
    highlights: [
      'Larger lots and estate-style properties',
      'Semi-rural character with modern conveniences',
      'Growing area with new development nearby',
      'Access to 407 ETR and rural trails',
    ],
    avgPrice: '$1.6M',
    priceRange: '$1M – $4M+',
    homeTypes: ['Detached', 'Estate Homes', 'Acreage Properties', 'Custom Builds'],
    schools: ['Palermo Public School', 'St. Mary Catholic Elementary School', 'Captain R. Wilson Public School'],
    nearbyAmenities: ['Bronte Creek Provincial Park', 'Palermo Village', '407 ETR Access', 'Bruce Trail access'],
    sellerInsight:
      'Palermo buyers are often looking for exactly what Toronto can\'t offer — space. Aerial/drone photography is essential for marketing larger properties here. Emphasize lot size, privacy, and the lifestyle appeal of semi-rural living within commuting distance.',
    image: '/neighbourhoods/falgarwood.jpg',
    mapQuery: 'Palermo, Oakville, Ontario',
  },
  {
    slug: 'uptown-core',
    name: 'Uptown Core',
    headline: 'Sell Your Home in Uptown Core — Oakville\'s Newest Urban Hub',
    description:
      'The Uptown Core is Oakville\'s rapidly developing urban centre, centred around Trafalgar Road and Dundas Street. With new condos, retail, and transit infrastructure, this area is attracting a new generation of Oakville residents. Sellers of condos and townhomes here benefit from strong demand driven by affordability and convenience.',
    highlights: [
      'Oakville\'s fastest-growing urban area',
      'New condo and mixed-use developments',
      'Future transit hub potential',
      'Walking distance to shops and restaurants along Trafalgar',
    ],
    avgPrice: '$750K',
    priceRange: '$450K – $1.2M',
    homeTypes: ['Condo', 'Townhouse', 'Stacked Townhouse', 'New Construction'],
    schools: ['Iroquois Ridge High School', 'St. Andrew Catholic Elementary School', 'Post\'s Corners Public School'],
    nearbyAmenities: ['Trafalgar Road retail', 'Dundas Street corridor', 'Town Centre', 'Future transit connections'],
    sellerInsight:
      'The Uptown Core market moves fast for well-priced condos and townhomes. Your competition is often new construction, so staging and competitive pricing are critical. Highlight any upgrades over builder-grade finishes and the convenience of the walkable location.',
    image: '/neighbourhoods/iroquois-ridge.jpg',
    mapQuery: 'Uptown Core, Oakville, Ontario',
  },
  {
    slug: 'iroquois-ridge',
    name: 'Iroquois Ridge',
    headline: 'Sell Your Home in Iroquois Ridge — Established Family Living in Central Oakville',
    description:
      'Iroquois Ridge is a well-established neighbourhood in central Oakville known for its excellent schools, mature lots, and family-friendly atmosphere. Nestled between Upper Middle Road and the QEW, residents enjoy easy access to shopping, trails, and transit while living in a quiet, tree-lined community.',
    highlights: [
      'Highly rated schools including Iroquois Ridge High School',
      'Mature lots with established landscaping',
      'Central location with easy highway access',
      'Close to Sixteen Mile Creek trails and green spaces',
    ],
    avgPrice: '$1.5M',
    priceRange: '$1M – $2.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse'],
    schools: ['Iroquois Ridge High School', 'Walden International School', 'Holy Family Catholic Elementary School'],
    nearbyAmenities: ['Iroquois Ridge Community Centre', 'Sixteen Mile Creek trails', 'Upper Oakville Shopping Centre', 'QEW Access'],
    sellerInsight:
      'Iroquois Ridge attracts families who want top-tier schools and a central location without the premium of South Oakville. Highlight school rankings and proximity to trails — these are the top two reasons buyers choose this neighbourhood.',
    image: '/neighbourhoods/iroquois-ridge.jpg',
    mapQuery: 'Iroquois Ridge, Oakville, Ontario',
  },
  {
    slug: 'sixteen-hollow',
    name: 'Sixteen Hollow',
    headline: 'Sell Your Home in Sixteen Hollow — Ravine Living in the Heart of Oakville',
    description:
      'Sixteen Hollow is a charming, established neighbourhood tucked along the Sixteen Mile Creek ravine system in central-south Oakville. Known for its mature tree canopy, winding streets, and proximity to both downtown Oakville and the creek trails, it offers a peaceful retreat with urban convenience.',
    highlights: [
      'Stunning ravine lots along Sixteen Mile Creek',
      'Mature tree canopy and quiet, winding streets',
      'Walking distance to downtown Oakville',
      'Excellent schools and family-friendly community',
    ],
    avgPrice: '$1.6M',
    priceRange: '$1.1M – $3M+',
    homeTypes: ['Detached', 'Semi-Detached', 'Bungalows', 'Custom Renovations'],
    schools: ['St. Gregory the Great Catholic Elementary School', 'Dr. David R. Williams Public School', 'St. Cecilia Catholic Elementary School'],
    nearbyAmenities: ['Sixteen Mile Creek trails', 'Downtown Oakville', 'Lions Valley Park', 'Oakville Centre for the Performing Arts'],
    sellerInsight:
      'Sixteen Hollow\'s ravine lots are its biggest draw — make sure drone photography captures the natural setting. Buyers here value the neighbourhood\'s established character and proximity to downtown, so emphasize walkability and the unique ravine lifestyle.',
    image: '/neighbourhoods/sixteen-hollow.jpg',
    mapQuery: 'Sixteen Hollow, Oakville, Ontario',
  },
];
