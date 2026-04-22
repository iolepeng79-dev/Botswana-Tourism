import { supabase } from './supabase';
import { LocationType } from '../types';

export interface LocationEntry {
  name: string;
  type: LocationType;
  children?: LocationEntry[];
}

export const BOTSWANA_LOCATIONS_HIERARCHY: LocationEntry[] = [
  {
    name: "South-East District",
    type: "district",
    children: [
      {
        name: "Gaborone",
        type: "city",
        children: [
          { name: "Central Business District (CBD)", type: "settlement", children: [
            { name: "iTowers", type: "location" },
            { name: "Square Mall", type: "location" },
            { name: "Three Dikgosi Monument", type: "location" }
          ]},
          { name: "Main Mall", type: "settlement", children: [
            { name: "Cresta President Hotel", type: "location" },
            { name: "Standard Chartered Bank", type: "location" }
          ]},
          { name: "Village", type: "suburb", children: [
            { name: "University of Botswana", type: "location" },
            { name: "National Stadium", type: "location" }
          ]},
          { name: "Phase 2", type: "suburb", children: [
            { name: "Grand Palm Hotel", type: "location" },
            { name: "Molapo Crossing Shopping Mall", type: "location" }
          ]},
          { name: "Gaborone West", type: "suburb", children: [
            { name: "Ba Isago University", type: "location" }
          ]}
        ]
      },
      {
        name: "Ramotswa",
        type: "village",
        children: [
          { name: "Taung", type: "ward", children: [
            { name: "Taung Primary School", type: "location" }
          ]},
          { name: "Lekgolabotlo", type: "ward", children: [] }
        ]
      },
      {
        name: "Tlokweng",
        type: "village",
        children: [
          { name: "Mafitlhakgosi", type: "ward", children: [] },
          { name: "Masetlheng", type: "ward", children: [] }
        ]
      }
    ]
  },
  {
    name: "North-West District",
    type: "district",
    children: [
      {
        name: "Maun",
        type: "town",
        children: [
          { name: "Matlapana", type: "settlement", children: [
            { name: "Old Bridge Backpackers", type: "location" },
            { name: "Audi Camp", type: "location" },
            { name: "Okavango River Lodge", type: "location" },
            { name: "Thamalakane River Lodge", type: "location" }
          ]},
          { name: "Boseja", type: "settlement", children: [
            { name: "Tshilli Farmhouse", type: "location" }
          ]},
          { name: "Sedie", type: "settlement", children: [
            { name: "Maun Airport", type: "location" },
            { name: "Cresta Riley's Hotel", type: "location" }
          ]},
          { name: "Wenela", type: "settlement", children: [
            { name: "Nhabe Museum", type: "location" }
          ]}
        ]
      },
      {
        name: "Gumare",
        type: "village",
        children: [
          { name: "Gumare Central", type: "ward", children: [] }
        ]
      },
      {
        name: "Shakawe",
        type: "village",
        children: [
          { name: "Shakawe Fishing Lodge", type: "location" },
          { name: "Drotsky's Cabins", type: "location" }
        ]
      }
    ]
  },
  {
    name: "Chobe District",
    type: "district",
    children: [
      {
        name: "Kasane",
        type: "town",
        children: [
          { name: "Plateau", type: "suburb", children: [
            { name: "Chobe Safari Lodge", type: "location" },
            { name: "Mowana Safari Resort & Spa", type: "location" },
            { name: "Chobe Chilwero", type: "location" }
          ]},
          { name: "Kazungula", type: "settlement", children: [
            { name: "Chobe Bakwena Lodge", type: "location" },
            { name: "Senyati Safari Camp", type: "location" }
          ]},
          { name: "Pandamatenga", type: "village", children: [
            { name: "Panda Farms", type: "location" }
          ]}
        ]
      }
    ]
  },
  {
    name: "Central District",
    type: "district",
    children: [
      {
        name: "Palapye",
        type: "town",
        children: [
          { name: "Ext 1", type: "suburb", children: [] },
          { name: "Lotsane", type: "ward", children: [
            { name: "BIUST University", type: "location" }
          ]}
        ]
      },
      {
        name: "Serowe",
        type: "village",
        children: [
          { name: "Botalaote", type: "ward", children: [
            { name: "Khama III Memorial Museum", type: "location" }
          ]}
        ]
      },
      {
        name: "Mahalapye",
        type: "town",
        children: [
          { name: "Madiba", type: "ward", children: [] }
        ]
      }
    ]
  },
  {
    name: "Southern District",
    type: "district",
    children: [
      {
        name: "Kanye",
        type: "village",
        children: [
          { name: "Mafhikana", type: "ward", children: [] }
        ]
      },
      {
        name: "Jwaneng",
        type: "town",
        children: [
          { name: "Unit 1", type: "suburb", children: [
            { name: "Jwaneng Diamond Mine", type: "location" }
          ]}
        ]
      }
    ]
  },
  {
    name: "Kweneng District",
    type: "district",
    children: [
      {
        name: "Molepolole",
        type: "village",
        children: [
          { name: "Borakalalo", type: "ward", children: [] }
        ]
      },
      {
        name: "Mogoditshane",
        type: "village",
        children: [
          { name: "Ledumadumane", type: "ward", children: [] }
        ]
      }
    ]
  },
  {
    name: "Kgatleng District",
    type: "district",
    children: [
      {
        name: "Mochudi",
        type: "village",
        children: [
          { name: "Boseja", type: "ward", children: [] }
        ]
      }
    ]
  },
  {
    name: "North-East District",
    type: "district",
    children: [
      {
        name: "Francistown",
        type: "city",
        children: [
          { name: "Light Industrial", type: "suburb", children: [] },
          { name: "Somerset", type: "suburb", children: [] }
        ]
      }
    ]
  },
  {
    name: "Ghanzi District",
    type: "district",
    children: [
      {
        name: "Ghanzi",
        type: "town",
        children: [
          { name: "Ghanzi Central", type: "ward", children: [
            { name: "Thakadu Camp", type: "location" },
            { name: "Kalahari Arms Hotel", type: "location" }
          ]}
        ]
      }
    ]
  },
  {
    name: "Kgalagadi District",
    type: "district",
    children: [
      {
        name: "Tsabong",
        type: "village",
        children: [
          { name: "Tsabong Central", type: "ward", children: [] }
        ]
      }
    ]
  }
];

export async function seedLocations() {
  if (!supabase) return { error: 'Supabase client not initialized' };

  try {
    // 1. Insert Districts
    const districts = [
      'South-East', 'Kweneng', 'Kgatleng', 'Southern', 'Central', 
      'North-East', 'North-West', 'Chobe', 'Ghanzi', 'Kgalagadi'
    ];
    
    const districtRecords = [];
    for (const name of districts) {
      const { data, error } = await supabase
        .from('locations')
        .upsert({ name, type: 'district' }, { onConflict: 'name,type' })
        .select()
        .single();
      if (error) console.error(`Dist error: ${name}`, error);
      else districtRecords.push(data);
    }

    // 2. Insert Towns/Villages
    const towns = [
      { d: 'South-East', n: 'Gaborone', t: 'city' },
      { d: 'South-East', n: 'Tlokweng', t: 'village' },
      { d: 'South-East', n: 'Ramotswa', t: 'village' },
      { d: 'Kweneng', n: 'Molepolole', t: 'village' },
      { d: 'Kweneng', n: 'Thamaga', t: 'village' },
      { d: 'North-West', n: 'Maun', t: 'town' },
      { d: 'North-West', n: 'Shakawe', t: 'village' },
      { d: 'Chobe', n: 'Kasane', t: 'town' },
      { d: 'Chobe', n: 'Kachikau', t: 'village' },
      { d: 'Central', n: 'Serowe', t: 'village' },
      { d: 'Central', n: 'Palapye', t: 'town' },
      { d: 'Central', n: 'Mahalapye', t: 'town' },
      { d: 'Southern', n: 'Kanye', t: 'village' },
      { d: 'Southern', n: 'Moshupa', t: 'village' },
      { d: 'Kgatleng', n: 'Mochudi', t: 'village' },
      { d: 'North-East', n: 'Francistown', t: 'city' },
      { d: 'Ghanzi', n: 'Ghanzi', t: 'town' },
      { d: 'Kgalagadi', n: 'Tsabong', t: 'village' }
    ];

    const townRecords = [];
    for (const item of towns) {
      const parent = districtRecords.find(d => d.name === item.d);
      if (!parent) continue;
      
      const { data, error } = await supabase
        .from('locations')
        .upsert({ name: item.n, type: item.t, parent_id: parent.id }, { onConflict: 'name,type,parent_id' })
        .select()
        .single();
      if (error) console.error(`Town error: ${item.n}`, error);
      else townRecords.push(data);
    }

    // 3. Auto-generate Wards (20 per town) -> ~360 records
    const wardBatches = [];
    for (const town of townRecords) {
      for (let i = 1; i <= 20; i++) {
        wardBatches.push({ 
          name: `${town.name} Ward ${i}`, 
          type: 'ward', 
          parent_id: town.id 
        });
      }
    }
    
    // Batch upsert wards
    const { data: wardRecords, error: wardError } = await supabase
      .from('locations')
      .upsert(wardBatches, { onConflict: 'name,type,parent_id' })
      .select();
    
    if (wardError) throw wardError;

    // 4. Auto-generate Locations (10 per ward) -> ~3600 records
    // Processing in smaller chunks to avoid payload limits
    const CHUNK_SIZE = 500;
    const locationBatches = [];
    for (const ward of (wardRecords || [])) {
      for (let i = 1; i <= 10; i++) {
        locationBatches.push({
          name: `${ward.name} Location ${i}`,
          type: 'location',
          parent_id: ward.id
        });
      }
    }

    for (let i = 0; i < locationBatches.length; i += CHUNK_SIZE) {
      const chunk = locationBatches.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase
        .from('locations')
        .upsert(chunk, { onConflict: 'name,type,parent_id' });
      if (error) console.error(`Location chunk error:`, error);
    }

    // 5. Add Key Tourism Locations
    const tourismData = [
      { n: 'Okavango Delta Camp', w: 'Maun Ward 1' },
      { n: 'Moremi Game Reserve', w: 'Maun Ward 2' },
      { n: 'Chobe National Park Gate', w: 'Kasane Ward 1' },
      { n: 'Kasane Waterfront', w: 'Kasane Ward 2' }
    ];

    for (const item of tourismData) {
      const parent = (wardRecords || []).find(w => w.name === item.w);
      if (parent) {
        await supabase
          .from('locations')
          .upsert({ name: item.n, type: 'location', parent_id: parent.id }, { onConflict: 'name,type,parent_id' });
      }
    }

    return { success: true, count: locationBatches.length + wardBatches.length + townRecords.length + districtRecords.length };
  } catch (err: any) {
    return { error: err.message };
  }
}
