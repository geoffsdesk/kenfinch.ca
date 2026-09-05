export interface Neighborhood {
  slug: string;
  name: string;
  /** Buyer-facing H1 */
  headline: string;
  description: string;
  highlights: string[];
  avgPrice: string;
  priceRange: string;
  homeTypes: string[];
  schools: string[];
  nearbyAmenities: string[];
  /** Who this neighbourhood suits */
  bestFor: string[];
  /** Commute reference points */
  commute: string;
  /** Ken's buying tip */
  buyerInsight: string;
  /** Ken's selling tip (kept for /sell content) */
  sellerInsight: string;
  image: string;
  mapQuery: string;
}

export const neighborhoods: Neighborhood[] = [
  {
    slug: 'old-oakville',
    name: 'Old Oakville',
    headline: 'Buying in Old Oakville: Heritage Streets, Lakefront Living, Blue-Chip Resale',
    description:
      'Old Oakville is the most sought-after address in Halton and one of the most recognisable in the GTA. Tree-lined streets, heritage homes, and a walk to Lakeshore Road and the harbour make it the neighbourhood buyers move up to rather than out of. Inventory is thin and competition is real, so buyers here need a firm pre-approval and a clear sense of what character features are worth paying for.',
    highlights: [
      'Walk to Lakeshore Road shops, restaurants, and the lakefront',
      'Heritage architecture with mature trees and deep lots',
      'Top-rated schools including New Central Public School and Appleby College',
      'Strongest long-term resale in Oakville',
    ],
    avgPrice: '$2.1M',
    priceRange: '$1.2M – $5M+',
    homeTypes: ['Detached', 'Semi-Detached', 'Heritage Homes', 'Custom Builds'],
    schools: ['New Central Public School', 'Appleby College', 'Elementary School Catholic Sainte-Marie'],
    nearbyAmenities: ['Lakeshore Road', 'Oakville Harbour', 'Centennial Square', 'Oakville GO Station'],
    bestFor: ['Move-up buyers', 'Downsizers who want walkability', 'Buyers prioritising resale'],
    commute: 'Oakville GO to Union in about 35 minutes; QEW access in 5 minutes.',
    buyerInsight:
      'Two homes on the same street can differ by $1M based on lot depth, heritage designation, and how well a renovation respected the original architecture. Before you fall for the porch, Ken checks heritage status, flood mapping near Sixteen Mile Creek, and what the last five comparable sales actually closed at. Expect to compete, and expect Ken to tell you when to walk.',
    sellerInsight:
      'Homes in Old Oakville sell fastest when they balance heritage character with modern updates. Buyers pay a significant premium for move-in-ready properties with updated kitchens and bathrooms while preserving original details.',
    image: '/neighbourhoods/old-oakville.jpg',
    mapQuery: 'Old Oakville, Ontario',
  },
  {
    slug: 'bronte',
    name: 'Bronte',
    headline: 'Buying in Bronte: Lakeside Village Living at a Range of Price Points',
    description:
      'Bronte has the harbour, the boardwalk, the independent shops, and a small-town rhythm that is rare inside the GTA. What buyers often miss is how wide the price range is: waterfront condos and townhomes in the village core sit a few streets from lakefront estates. It is a favourite for families relocating from Toronto and for downsizers who want to stay near the water without a large lot to maintain.',
    highlights: [
      'Bronte Harbour, the pier, and waterfront parks',
      'Village core with local shops, cafes, and restaurants',
      'Condos and townhomes make it Oakville’s most accessible lakeside option',
      'Bronte Creek Provincial Park minutes away',
    ],
    avgPrice: '$1.6M',
    priceRange: '$900K – $3.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse', 'Condo'],
    schools: ['St. Dominic Catholic School', 'Blakelock High School', 'St. Joseph Catholic Elementary School'],
    nearbyAmenities: ['Bronte Harbour', 'Bronte Creek Provincial Park', 'Bronte Village Mall', 'Coronation Park'],
    bestFor: ['Downsizers', 'Families relocating from Toronto', 'Condo buyers who want the lake'],
    commute: 'Bronte GO to Union in about 45 minutes; QEW at Bronte Road.',
    buyerInsight:
      'In the village core, check condo reserve funds and status certificates carefully: some buildings are older and special assessments happen. For freehold, the streets south of Lakeshore carry a premium that holds in every market. Bronte buyers with a pre-approval in hand routinely win against buyers who are still waiting on their bank.',
    sellerInsight:
      'Bronte buyers are often families moving from Toronto or Milton looking for community feel with lake access. Staging outdoor spaces and highlighting walkability to the harbour adds perceived value.',
    image: '/neighbourhoods/bronte.jpg',
    mapQuery: 'Bronte, Oakville, Ontario',
  },
  {
    slug: 'glen-abbey',
    name: 'Glen Abbey',
    headline: 'Buying in Glen Abbey: Big Lots, Top Schools, and the Golf Course Next Door',
    description:
      'Glen Abbey is the neighbourhood Toronto families picture when they say they are moving to Oakville: generous lots, mature trees, excellent schools, and a strong community identity built around the famous golf course. Homes are mostly 1980s and 1990s executive builds, many now renovated. It trades briskly, which means good comparables exist and Ken can price your offer with confidence.',
    highlights: [
      'Home of the iconic Glen Abbey Golf Course',
      'Large lots with mature landscaping',
      'Abbey Park High School and strong elementary options',
      'Minutes to the QEW and Upper Oakville Shopping Centre',
    ],
    avgPrice: '$1.8M',
    priceRange: '$1.1M – $4M+',
    homeTypes: ['Detached', 'Executive Homes', 'Estate Properties'],
    schools: ['Abbey Park High School', 'Pilgrim Wood Public School', 'St. Matthew Catholic Elementary School'],
    nearbyAmenities: ['Glen Abbey Golf Course', 'Upper Oakville Shopping Centre', 'Glen Abbey Recreation Centre', 'Sixteen Mile Creek trails'],
    bestFor: ['Families relocating from Toronto', 'Move-up buyers who want a lot', 'Golfers'],
    commute: 'QEW at Dorval in 5 minutes; Oakville GO about 10 minutes by car.',
    buyerInsight:
      'Ravine and golf-course-backing lots command a premium of 10 to 20 percent and hold it; interior lots are the value play. Many homes have original 1990s mechanicals, so budget for furnace, roof, and windows in your offer strategy. Ken has sold on most streets here and will tell you which renovations were done well and which were done for the listing photos.',
    sellerInsight:
      'Glen Abbey homes sell best when marketed to families relocating from Toronto. Highlight school rankings, proximity to the golf course, and the neighbourhood’s established reputation.',
    image: '/neighbourhoods/glen-abbey.jpg',
    mapQuery: 'Glen Abbey, Oakville, Ontario',
  },
  {
    slug: 'river-oaks',
    name: 'River Oaks',
    headline: 'Buying in River Oaks: Modern Family Homes in North Oakville',
    description:
      'River Oaks is a master-planned community in North Oakville that has become the default choice for young families and first-time detached buyers. Homes are newer, layouts are open, schools are highly rated, and the trail network is extensive. Because the housing stock is consistent, prices are predictable and competition is steady rather than frantic.',
    highlights: [
      'Modern homes built from the 2000s to the 2020s',
      'Extensive trail network and parks',
      'Highly rated newer schools',
      'Easy access to Highways 403 and 407',
    ],
    avgPrice: '$1.4M',
    priceRange: '$800K – $2.2M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse', 'Stacked Townhouse'],
    schools: ['River Oaks Public School', 'Holy Trinity Catholic Secondary School', 'Rotherglen School'],
    nearbyAmenities: ['River Oaks Community Centre', 'Sixteen Mile Sports Complex', 'North Park', 'SmartCentres Oakville'],
    bestFor: ['First-time detached buyers', 'Young families', 'Buyers upgrading from a condo'],
    commute: 'Highway 403 and 407 within minutes; Oakville GO about 15 minutes by car.',
    buyerInsight:
      'Townhomes and semis here are where many first-time buyers get into Oakville, and the insured mortgage cap of $1.5 million means most of River Oaks can be bought with less than 20 percent down. Check for freehold versus condo-road townhomes (the monthly fee matters for qualifying), and look at lot exposure: south-facing backyards on the ravine side get the premium.',
    sellerInsight:
      'River Oaks attracts a younger demographic upgrading from condos or first homes. Modern finishes and open-concept layouts are expected.',
    image: '/neighbourhoods/river-oaks.jpg',
    mapQuery: 'River Oaks, Oakville, Ontario',
  },
  {
    slug: 'west-oak-trails',
    name: 'West Oak Trails',
    headline: 'Buying in West Oak Trails: Oakville’s Best Value for Families',
    description:
      'West Oak Trails is where many buyers priced out of South Oakville land, and most are glad they did. It offers a wide mix of home styles, strong schools, and one of the best trail systems in town, all at a lower entry price than the lakeside neighbourhoods. Turnover is healthy, so there is usually something to see.',
    highlights: [
      'Diverse housing stock at accessible price points',
      'Trail systems and green space throughout',
      'Strong schools including Garth Webb Secondary',
      'Close to Oakville Place and major retail',
    ],
    avgPrice: '$1.3M',
    priceRange: '$750K – $2M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse', 'Condo'],
    schools: ['West Oak Public School', 'St. Joan of Arc Catholic School', 'Garth Webb Secondary School'],
    nearbyAmenities: ['West Oak Trails Community Centre', 'Oakville Place Mall', 'Neyagawa Boulevard trails', 'Sixteen Mile Creek'],
    bestFor: ['First-time buyers', 'Families who want space over prestige', 'Buyers from Mississauga and Milton'],
    commute: 'QEW via Third Line or Bronte Road; Bronte GO about 10 minutes by car.',
    buyerInsight:
      'Well-priced homes here draw multiple offers, so your pre-approval and deposit need to be ready before the listing hits. Ken’s advice: decide your walk-away number on the comparable sales, not the list price, because list prices in West Oak Trails are often set deliberately low to generate offer nights.',
    sellerInsight:
      'West Oak Trails is where many first-time Oakville buyers start their search. Price competitively and you will often see multiple offers.',
    image: '/neighbourhoods/westoak-trails.jpg',
    mapQuery: 'West Oak Trails, Oakville, Ontario',
  },
  {
    slug: 'eastlake',
    name: 'Eastlake',
    headline: 'Buying in Eastlake: Established South Oakville, Steps from the GO',
    description:
      'Eastlake is mature South Oakville: tree-lined streets, mid-century bungalows and side-splits on wide lots, and a growing number of tasteful rebuilds. It is walkable to Oakville GO and downtown, which makes it a favourite of Toronto commuters. Buyers choose between renovated homes at a premium and original homes with renovation upside.',
    highlights: [
      'South Oakville lakeside location',
      'Mature trees and established streetscapes',
      'Walk to Oakville GO and downtown',
      'Highly ranked public and Catholic schools',
    ],
    avgPrice: '$1.7M',
    priceRange: '$1M – $3.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Bungalows', 'Custom Renovations'],
    schools: ['E.J. James Public School', 'St. Vincent Catholic Elementary School', 'Linbrook School'],
    nearbyAmenities: ['Oakville GO Station', 'Downtown Oakville', 'Gairloch Gardens', 'Oakville Museum'],
    bestFor: ['Toronto commuters', 'Renovators and builders', 'Buyers who want a lot near the lake'],
    commute: 'Walk or short drive to Oakville GO; Union in about 35 minutes.',
    buyerInsight:
      'Original bungalows on 60-foot lots are the entry point and the renovation opportunity; make sure your financing plan includes renovation costs, and ask Ken about purchase-plus-improvements mortgages. Verify permits on any renovated home. Homes east of Trafalgar and south of Cornwall carry the strongest premium.',
    sellerInsight:
      'Eastlake buyers value walkability and proximity to the GO train. Document all upgrades; buyers pay premiums for quality renovations that respect the neighbourhood’s character.',
    image: '/neighbourhoods/east-lake.jpg',
    mapQuery: 'Eastlake, Oakville, Ontario',
  },
  {
    slug: 'college-park',
    name: 'College Park',
    headline: 'Buying in College Park: Central Oakville Convenience at Every Price Point',
    description:
      'College Park sits in the middle of Oakville, next to Sheridan College, Oakville Place, and the main transit routes. It has the widest spread of housing in town, from condos under $600K to detached homes on large lots, which makes it a practical first stop for first-time buyers, investors, and downsizers alike.',
    highlights: [
      'Central location near Sheridan College',
      'Steps from Oakville Place shopping',
      'Excellent transit connections',
      'Condos, townhomes, and detached homes side by side',
    ],
    avgPrice: '$1.1M',
    priceRange: '$500K – $1.8M',
    homeTypes: ['Detached', 'Townhouse', 'Condo', 'Semi-Detached'],
    schools: ['White Oaks Secondary School', 'Sunningdale Public School', 'Gaétan-Gervais Secondary School'],
    nearbyAmenities: ['Sheridan College', 'Oakville Place', 'Oakville Transit Hub', 'QEW Access'],
    bestFor: ['First-time buyers', 'Investors', 'Downsizers who want to stay central'],
    commute: 'QEW at Trafalgar; Oakville GO about 8 minutes by car or a short bus ride.',
    buyerInsight:
      'This is the best neighbourhood in Oakville to buy a first condo, and rental demand from Sheridan students makes it a sensible investor market. For condos, Ken reviews the status certificate and the building’s fee history before you offer. For detached homes, the 1960s and 1970s stock often has larger lots than newer areas at a lower price per square foot.',
    sellerInsight:
      'College Park attracts first-time buyers, investors, and downsizers. The condo market is strong thanks to proximity to Sheridan College.',
    image: '/neighbourhoods/college-park.jpg',
    mapQuery: 'College Park, Oakville, Ontario',
  },
  {
    slug: 'morrison',
    name: 'Morrison',
    headline: 'Buying in Morrison: South Oakville Living Without the Old Oakville Price Tag',
    description:
      'Morrison is a quiet South Oakville neighbourhood between the QEW and the lake that offers real value next to its pricier neighbours. Good schools, mature lots, and easy access to both the highway and Oakville GO make it popular with buyers who want a South Oakville address and a realistic budget.',
    highlights: [
      'South Oakville location at accessible prices',
      'Quiet, family-friendly streets',
      'Easy access to the QEW and Oakville GO',
      'Close to Coronation Park and the waterfront',
    ],
    avgPrice: '$1.4M',
    priceRange: '$900K – $2.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Bungalows', 'Backsplit'],
    schools: ['St. Mildred’s-Lightbourn School', 'Maple Grove Public School', 'Oakville Trafalgar High School'],
    nearbyAmenities: ['Coronation Park', 'Shell Park', 'South Oakville Centre', 'Oakville GO Station'],
    bestFor: ['Buyers priced out of Old Oakville and Eastlake', 'Families targeting Oakville Trafalgar High School', 'Commuters'],
    commute: 'QEW in minutes; Oakville GO about 8 minutes by car.',
    buyerInsight:
      'Morrison has quietly appreciated as buyers look for South Oakville alternatives, so do not assume it is the bargain it was five years ago. Ken watches for original bungalows on large lots, which give you the option to renovate now and build later. Check the school boundary carefully; Oakville Trafalgar High School catchment is a major driver of value here.',
    sellerInsight:
      'Morrison is gaining momentum as South Oakville buyers seek alternatives to Old Oakville prices. Position your listing as South Oakville value.',
    image: '/neighbourhoods/clearview.jpg',
    mapQuery: 'Morrison, Oakville, Ontario',
  },
  {
    slug: 'palermo',
    name: 'Palermo',
    headline: 'Buying in Palermo: Space, Privacy, and Room to Grow on Oakville’s Edge',
    description:
      'Palermo sits on Oakville’s northwest edge and delivers what the rest of the GTA cannot: larger lots, privacy, and a semi-rural feel within commuting range. It is the right neighbourhood for buyers who want room for a workshop, a pool, or simply distance from the neighbours, and for those watching the new development along Dundas Street.',
    highlights: [
      'Larger lots and estate-style properties',
      'Semi-rural character with modern conveniences',
      'New construction nearby along Dundas Street',
      'Access to Highway 407 and rural trails',
    ],
    avgPrice: '$1.6M',
    priceRange: '$1M – $4M+',
    homeTypes: ['Detached', 'Estate Homes', 'Acreage Properties', 'Custom Builds', 'New Construction'],
    schools: ['Palermo Public School', 'St. Mary Catholic Elementary School', 'Captain R. Wilson Public School'],
    nearbyAmenities: ['Bronte Creek Provincial Park', 'Palermo Village', 'Highway 407 access', 'Bruce Trail access'],
    bestFor: ['Buyers who want land', 'New-construction buyers', 'Multi-generational households'],
    commute: 'Highway 407 at Bronte Road; QEW about 12 minutes; Bronte GO about 15 minutes.',
    buyerInsight:
      'Rural-lot properties may be on well and septic, which affects both inspection and which lenders will finance them; Ken confirms that before you write. For new builds along Dundas, remember that builder pricing, closing costs, and the HST rebate rules differ from resale, and that first-time buyers of new construction may qualify for a 30-year insured amortization.',
    sellerInsight:
      'Palermo buyers are looking for space. Aerial photography is essential for marketing larger properties here.',
    image: '/neighbourhoods/falgarwood.jpg',
    mapQuery: 'Palermo, Oakville, Ontario',
  },
  {
    slug: 'uptown-core',
    name: 'Uptown Core',
    headline: 'Buying in Uptown Core: Oakville’s Most Affordable Way In',
    description:
      'The Uptown Core around Trafalgar Road and Dundas Street is Oakville’s urban centre and its most affordable entry point. New condos, stacked towns, and mixed-use buildings sit beside shops, restaurants, and transit. For first-time buyers who want an Oakville address and a walkable lifestyle, this is usually where the search starts.',
    highlights: [
      'Oakville’s fastest-growing urban area',
      'New condo and mixed-use developments',
      'Walk to shops and restaurants along Trafalgar Road',
      'Transit hub with regional bus connections',
    ],
    avgPrice: '$750K',
    priceRange: '$450K – $1.2M',
    homeTypes: ['Condo', 'Townhouse', 'Stacked Townhouse', 'New Construction'],
    schools: ['Iroquois Ridge High School', 'St. Andrew Catholic Elementary School', 'Post’s Corners Public School'],
    nearbyAmenities: ['Trafalgar Road retail', 'Dundas Street corridor', 'Oakville Town Centre', 'Uptown Core transit terminal'],
    bestFor: ['First-time buyers', 'Young professionals', 'Investors'],
    commute: 'Highway 403 and 407 nearby; bus to Oakville GO; Union in about an hour door to door.',
    buyerInsight:
      'With prices from the mid-$400Ks, this is where the 5 percent minimum down payment and first-time buyer programs (FHSA, Home Buyers’ Plan, land transfer tax rebate) do the most work. Ken compares resale units against pre-construction on a total-cost basis, including maintenance fees, parking, and locker, because the monthly fee affects how much mortgage you qualify for.',
    sellerInsight:
      'The Uptown Core market moves fast for well-priced condos and townhomes. Your competition is often new construction, so staging and pricing are critical.',
    image: '/neighbourhoods/iroquois-ridge.jpg',
    mapQuery: 'Uptown Core, Oakville, Ontario',
  },
  {
    slug: 'iroquois-ridge',
    name: 'Iroquois Ridge',
    headline: 'Buying in Iroquois Ridge: Top Schools and a Central Address',
    description:
      'Iroquois Ridge is established central Oakville: mature lots, quiet streets, and some of the most sought-after schools in the region, anchored by Iroquois Ridge High School. Buyers get a location between Upper Middle Road and the QEW with fast access to shopping, trails, and transit, without the premium of the lakeside neighbourhoods.',
    highlights: [
      'Iroquois Ridge High School and strong feeder schools',
      'Mature lots with established landscaping',
      'Central location with quick highway access',
      'Sixteen Mile Creek trails and parks',
    ],
    avgPrice: '$1.5M',
    priceRange: '$1M – $2.5M',
    homeTypes: ['Detached', 'Semi-Detached', 'Townhouse'],
    schools: ['Iroquois Ridge High School', 'Walden International School', 'Holy Family Catholic Elementary School'],
    nearbyAmenities: ['Iroquois Ridge Community Centre', 'Sixteen Mile Creek trails', 'Upper Oakville Shopping Centre', 'QEW Access'],
    bestFor: ['Families choosing by school', 'Move-up buyers from townhomes', 'Commuters to Mississauga and Toronto'],
    commute: 'QEW at Trafalgar or Ford Drive; Oakville GO about 10 minutes.',
    buyerInsight:
      'School catchment drives value here, and boundaries do change; Ken verifies the current Halton District School Board boundary for any address before you offer. Homes are largely 1980s to 2000s, so budget for windows and mechanicals on original homes. Townhomes on the east side are the value entry for buyers who want the schools.',
    sellerInsight:
      'Iroquois Ridge attracts families who want top-tier schools and a central location. Highlight school rankings and proximity to trails.',
    image: '/neighbourhoods/iroquois-ridge.jpg',
    mapQuery: 'Iroquois Ridge, Oakville, Ontario',
  },
  {
    slug: 'sixteen-hollow',
    name: 'Sixteen Hollow',
    headline: 'Buying in Sixteen Hollow: Ravine Lots Near Downtown Oakville',
    description:
      'Sixteen Hollow follows the Sixteen Mile Creek ravine in central-south Oakville. Winding streets, a mature tree canopy, and a short trip to downtown make it feel far quieter than its location suggests. Buyers come for the ravine lots and the established character, and they tend to stay for decades, which keeps inventory tight.',
    highlights: [
      'Ravine lots along Sixteen Mile Creek',
      'Mature tree canopy and quiet, winding streets',
      'Minutes to downtown Oakville',
      'Excellent schools and a settled community',
    ],
    avgPrice: '$1.6M',
    priceRange: '$1.1M – $3M+',
    homeTypes: ['Detached', 'Semi-Detached', 'Bungalows', 'Custom Renovations'],
    schools: ['St. Gregory the Great Catholic Elementary School', 'Dr. David R. Williams Public School', 'St. Cecilia Catholic Elementary School'],
    nearbyAmenities: ['Sixteen Mile Creek trails', 'Downtown Oakville', 'Lions Valley Park', 'Oakville Centre for the Performing Arts'],
    bestFor: ['Buyers who want a ravine lot', 'Long-term family buyers', 'Downsizers who want a bungalow near downtown'],
    commute: 'QEW at Kerr Street or Dorval; Oakville GO about 7 minutes.',
    buyerInsight:
      'Ravine lots are the draw, and they come with Conservation Halton setbacks that limit additions and pools; Ken pulls the regulated-area mapping before you offer so there are no surprises. Because homes rarely trade, comparable sales can be a year old. Ken adjusts for the market shift rather than anchoring on a stale number.',
    sellerInsight:
      'Sixteen Hollow’s ravine lots are its biggest draw; make sure drone photography captures the natural setting.',
    image: '/neighbourhoods/sixteen-hollow.jpg',
    mapQuery: 'Sixteen Hollow, Oakville, Ontario',
  },
];
