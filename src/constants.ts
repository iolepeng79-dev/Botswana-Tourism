import { BusinessCategory, LocationData } from './types';

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'Lodge',
  'Safari Camp',
  'Hotel',
  'Car Rental',
  'Wellness and Therapy',
  'Guest House',
  'Restaurant',
  'Aviation Tours',
  'Travel Tours',
  'Taxi'
];

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", 
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", 
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", 
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", 
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", 
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", 
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", 
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", 
  "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", 
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", 
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", 
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", 
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export const BOTSWANA_LOCATIONS: LocationData = {
  districts: [
    {
      name: "North-West District",
      settlements: [
        {
          name: "Maun",
          regions: [
            { 
              name: "Okavango Delta area", 
              locations: ["Eagle Island Camp", "Belmond Savute Elephant Lodge", "Xaxaba Airfield Area"] 
            },
            { 
              name: "Thamalakane Riverfront", 
              locations: ["Discovery Bed & Breakfast", "Maun Lodge", "Cresta Riley's"] 
            },
            {
              name: "Disaneng/Matshwane",
              locations: ["Residential Business Zone A", "GPS Point -19.98, 23.42"]
            }
          ]
        },
        {
          name: "Shorobe",
          regions: [
            {
              name: "Shorobe Village Outskirts",
              locations: ["Community Trust Office", "Shorobe Camp Site"]
            }
          ]
        }
      ]
    },
    {
      name: "Chobe District",
      settlements: [
        {
          name: "Kasane",
          regions: [
            {
              name: "Chobe Riverfront",
              locations: ["Chobe Game Lodge", "Chobe Marina Lodge", "Cresta Mowana Safari Resort"]
            },
            {
              name: "Plateau Area",
              locations: ["Plateau Residential Area", "Kasane Plateau Viewpoint"]
            }
          ]
        },
        {
          name: "Kazungula",
          regions: [
            {
              name: "Kazungula Ferry/Bridge Area",
              locations: ["Kazungula Border Post", "Truck Inn"]
            }
          ]
        }
      ]
    },
    {
      name: "South-East District",
      settlements: [
        {
          name: "Gaborone",
          regions: [
            {
              name: "CBD",
              locations: ["iTowers", "The Square", "Ministry of Finance"]
            },
            {
              name: "Phakalane",
              locations: ["Phakalane Golf Estate", "Mowana Park"]
            }
          ]
        }
      ]
    },
    {
      name: "Central District",
      settlements: [
        {
          name: "Serowe",
          regions: [
            {
              name: "Town Centre",
              locations: ["Khama III Memorial Museum", "Serowe Mall"]
            }
          ]
        },
        {
          name: "Palapye",
          regions: [
            {
              name: "Lotsane Area",
              locations: ["Lotsane Junction Mall", "Palapye Guest House"]
            }
          ]
        }
      ]
    }
  ]
};
