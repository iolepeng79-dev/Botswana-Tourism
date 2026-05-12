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
          { name: "Block 3", type: "area" },
          { name: "Block 5", type: "area" },
          { name: "Block 6", type: "area" },
          { name: "Block 7", type: "area" },
          { name: "Block 8", type: "area" },
          { name: "Block 9", type: "area" },
          { name: "Block 10", type: "area" },
          { name: "Extension 2", type: "area" },
          { name: "Extension 4", type: "area" },
          { name: "Phase 1", type: "area" },
          { name: "Broadhurst", type: "area" },
          { name: "Village", type: "area" },
          { name: "CBD", type: "area", children: [
            { name: "Main Mall", type: "special_place" },
            { name: "Commerce Park", type: "special_place" },
            { name: "Kgale Hill", type: "special_place" },
            { name: "Gaborone Dam", type: "special_place" },
            { name: "Riverwalk", type: "special_place" },
            { name: "Fairgrounds", type: "special_place" },
            { name: "Airport Junction", type: "special_place" }
          ]},
          { name: "Gaborone West", type: "area" },
          { name: "Old Naledi", type: "area" },
          { name: "Bontleng", type: "area" }
        ]
      },
      {
        name: "Tlokweng",
        type: "village",
        children: [
          { name: "Tlokweng Central", type: "ward" },
          { name: "Tlokweng Border Gate", type: "ward", children: [
            { name: "Border Post", type: "special_place" }
          ]},
          { name: "Tlokweng Industrial", type: "ward", children: [
            { name: "Tlokweng Shopping Complex", type: "special_place" }
          ]},
          { name: "Tlokweng Kgotla", type: "ward", children: [
             { name: "River Crossing", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Ramotswa",
        type: "village",
        children: [
          { name: "Ramotswa Central", type: "ward" },
          { name: "Goo-Ramotswa", type: "ward" },
          { name: "Taung", type: "ward" },
          { name: "Ramotswa Kgotla", type: "ward", children: [
            { name: "Main Kgotla", type: "special_place" },
            { name: "Ramotswa Border Route", type: "special_place" }
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
          { name: "Borakalalo", type: "ward" },
          { name: "Bokaa Ward", type: "ward" },
          { name: "Mokgalo", type: "ward" },
          { name: "Lekgwapaneng", type: "ward" },
          { name: "Tshosa", type: "ward" },
          { name: "Molepolole Central", type: "ward", children: [
            { name: "Molepolole Main Kgotla", type: "special_place" },
            { name: "Scottish Livingstone Hospital", type: "special_place" },
            { name: "Molepolole Industrial", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Thamaga",
        type: "village",
        children: [
          { name: "Thamaga Central", type: "ward" },
          { name: "Baebele", type: "ward" },
          { name: "Thamaga Kgotla", type: "ward", children: [
            { name: "Thamaga Pottery", type: "special_place" },
            { name: "Main Kgotla", type: "special_place" }
          ]}
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
          { name: "Pilane", type: "ward" },
          { name: "Boseja", type: "ward" },
          { name: "Mochudi Central", type: "ward" },
          { name: "Mochudi Kgotla", type: "ward", children: [
            { name: "Phuthadikobo Museum", type: "special_place" },
            { name: "Linchwe View", type: "special_place" },
            { name: "Main Kgotla", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Bokaa",
        type: "village",
        children: [
          { name: "Bokaa Central", type: "ward" },
          { name: "Bokaa Kgotla", type: "ward", children: [
            { name: "Bokaa Dam", type: "special_place" },
            { name: "Picnic Area", type: "special_place" }
          ]}
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
          { name: "Seherelela", type: "ward" },
          { name: "Mafhikana", type: "ward" },
          { name: "Kanye Central", type: "ward" },
          { name: "Kanye Kgotla", type: "ward", children: [
            { name: "Bangwaketse Main Kgotla", type: "special_place" },
            { name: "Kanye Hills", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Jwaneng",
        type: "town",
        children: [
          { name: "Phase 1", type: "area" },
          { name: "Phase 2", type: "area" },
          { name: "Industrial Area", type: "area", children: [
             { name: "Jwaneng Mine", type: "special_place" },
             { name: "Airport Area", type: "special_place" },
             { name: "Mine Residential Camp", type: "special_place" }
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
        name: "Serowe",
        type: "village",
        children: [
          { name: "Serowe Central", type: "ward" },
          { name: "Serowe North", type: "ward" },
          { name: "Serowe South", type: "ward" },
          { name: "Boiteko", type: "ward", children: [
            { name: "Khama Rhino Sanctuary", type: "special_place" },
            { name: "Royal Cemetery", type: "special_place" },
            { name: "Main Kgotla", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Palapye",
        type: "town",
        children: [
          { name: "Lotsane", type: "ward" },
          { name: "Boikago", type: "ward" },
          { name: "Palapye Industrial", type: "ward", children: [
            { name: "BIUST", type: "special_place" },
            { name: "Morupule Mine", type: "special_place" },
            { name: "Palapye Junction", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Orapa",
        type: "town",
        children: [
          { name: "Orapa Camp", type: "area" },
          { name: "Orapa Central", type: "area", children: [
            { name: "Orapa Mine", type: "special_place" },
            { name: "Orapa Airport", type: "special_place" },
            { name: "Game Park", type: "special_place" }
          ]}
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
          { name: "Somerset East", type: "area" },
          { name: "Somerset West", type: "area" },
          { name: "Monarch", type: "area" },
          { name: "Blue Jacket", type: "area" },
          { name: "Satellite", type: "area", children: [
            { name: "Tati River", type: "special_place" },
            { name: "Gerald Estates", type: "special_place" },
            { name: "Francistown CBD", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Maitengwe",
        type: "village",
        children: [
          { name: "Maitengwe Central", type: "ward" },
          { name: "Maitengwe Kgotla", type: "ward", children: [
            { name: "Border Farms", type: "special_place" },
            { name: "Grazing Lands", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Sebina",
        type: "village",
        children: [
          { name: "Sebina Central", type: "ward" },
          { name: "Sebina Kgotla", type: "ward", children: [
            { name: "Cattle Post", type: "special_place" },
            { name: "Fields Area", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Matshelagabedi",
        type: "village",
        children: [
          { name: "Matshelagabedi Central", type: "ward" },
          { name: "Matshelagabedi Kgotla", type: "ward", children: [
            { name: "Border Route", type: "special_place" }
          ]}
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
          { name: "Boseja", type: "ward" },
          { name: "Sedie", type: "ward" },
          { name: "Disaneng", type: "ward" },
          { name: "Mathiba", type: "ward" },
          { name: "Boronyane", type: "ward" },
          { name: "Wenela", type: "ward", children: [
            { name: "Maun Airport", type: "special_place" },
            { name: "Tourism Hub", type: "special_place" },
            { name: "Okavango Access Point", type: "special_place" },
            { name: "Safari Lodges", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Khwai",
        type: "village",
        children: [
          { name: "Khwai Central", type: "ward" },
          { name: "Khwai Kgotla", type: "ward", children: [
            { name: "Khwai River Camps", type: "special_place" },
            { name: "Moremi South Gate", type: "special_place" },
            { name: "Khwai Safari Area", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Sankuyo",
        type: "village",
        children: [
          { name: "Sankuyo Central", type: "ward" },
          { name: "Sankuyo Kgotla", type: "ward", children: [
            { name: "Sankuyo Airstrip", type: "special_place" },
            { name: "Conservation Area", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Gumare",
        type: "village",
        children: [
          { name: "Gumare Central", type: "ward" },
          { name: "Gumare Kgotla", type: "ward", children: [
            { name: "River Basin", type: "special_place" },
            { name: "Gumare Market", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Seronga",
        type: "village",
        children: [
          { name: "Seronga Central", type: "ward" },
          { name: "Seronga Kgotla", type: "ward", children: [
            { name: "Boat Station", type: "special_place" },
            { name: "Safari Zone", type: "special_place" },
            { name: "Okavango Panhandle", type: "special_place" }
          ]}
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
          { name: "Plateau", type: "area" },
          { name: "Kazungula Road", type: "area" },
          { name: "CBD", type: "area", children: [
            { name: "Chobe Riverfront", type: "special_place" },
            { name: "Kasane Marina", type: "special_place" },
            { name: "Safari Lodges", type: "special_place" },
            { name: "Airport Zone", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Kazungula",
        type: "village",
        children: [
          { name: "Kazungula Central", type: "ward" },
          { name: "Border Area", type: "ward", children: [
            { name: "Kazungula Border Post", type: "special_place" },
            { name: "Kazungula Bridge", type: "special_place" },
            { name: "Truck Stop", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Pandamatenga",
        type: "village",
        children: [
          { name: "Pandamatenga Farms", type: "ward" },
          { name: "Pandamatenga Central", type: "ward", children: [
            { name: "Wildlife Corridor", type: "special_place" },
            { name: "Grain Storage Area", type: "special_place" }
          ]}
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
          { name: "Ghanzi Central", type: "area" },
          { name: "Ghanzi Farms", type: "area", children: [
            { name: "San Cultural Village", type: "special_place" },
            { name: "Ghanzi Airstrip", type: "special_place" }
          ]}
        ]
      },
      {
        name: "D’Kar",
        type: "village",
        children: [
          { name: "D’Kar Central", type: "ward" },
          { name: "D’Kar Kgotla", type: "ward", children: [
            { name: "Cultural Centre", type: "special_place" }
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
          { name: "Tsabong Central", type: "ward" },
          { name: "Tsabong Kgotla", type: "ward", children: [
            { name: "Camel Park", type: "special_place" },
            { name: "Border Route", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Kang",
        type: "village",
        children: [
          { name: "Kang Central", type: "ward" },
          { name: "Kang Kgotla", type: "ward", children: [
            { name: "Truck Stop", type: "special_place" },
            { name: "Commercial Strip", type: "special_place" }
          ]}
        ]
      },
      {
        name: "Bokspits",
        type: "village",
        children: [
          { name: "Bokspits Central", type: "ward" },
          { name: "Border Settlement", type: "ward", children: [
            { name: "Bokspits Border Post", type: "special_place" }
          ]}
        ]
      }
    ]
  }
];

export async function seedLocations() {
  if (!supabase) return { error: 'Supabase not initialized' };

  try {
    const processEntry = async (entry: LocationEntry, parentId: string | null = null) => {
      const { data, error } = await supabase!
        .from('locations')
        .upsert({ 
          name: entry.name, 
          type: entry.type, 
          parent_id: parentId 
        }, { onConflict: 'name,type,parent_id' })
        .select()
        .single();
      
      if (error) return null;
      
      if (entry.children && entry.children.length > 0) {
        for (const child of entry.children) {
          await processEntry(child, data.id);
        }
      }
      return data;
    };

    for (const district of BOTSWANA_LOCATIONS_HIERARCHY) {
      await processEntry(district);
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// End of file
