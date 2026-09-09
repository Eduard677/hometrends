export const STORE = {
  name: "Home Trends Furniture",
  shortName: "Home Trends",
  owners: "Finbar & Eileen Keaveney",
  since: 2013,
  tagline: "Quality and comfort, considered.",
  addressLine: "29 Parnell Street",
  town: "Ennis, Co. Clare",
  eircode: "V95 ED79",
  address: "29 Parnell Street, Ennis, Co. Clare, V95 ED79",
  addressLong:
    "Home Trends Furniture, 29 Parnell Street, Clonroad Beg, Ennis, Co. Clare, V95 ED79, Ireland",
  phone: "065 679 7853",
  phoneHref: "tel:+353656797853",
  email: "hometrendsennis@gmail.com",
  emailHref: "mailto:hometrendsennis@gmail.com",
  maps: "https://maps.app.goo.gl/gvfKib6Bakh1eito8",
  instagram: "https://www.instagram.com/hometrends.ennis/",
  instagramPosts: [
    {
      id: "oak-bedroom",
      href: "https://www.instagram.com/hometrends.ennis/",
      image: "/media/editorial/from-shop-bedroom.jpg",
      alt: "An oak bed on the Home Trends floor",
    },
    {
      id: "dining-table",
      href: "https://www.instagram.com/hometrends.ennis/",
      image: "/media/editorial/search-tables.jpg",
      alt: "A dining table in afternoon light",
    },
    {
      id: "fireside-chair",
      href: "https://www.instagram.com/hometrends.ennis/",
      image: "/media/editorial/search-seating.jpg",
      alt: "A fireside chair on the floor",
    },
    {
      id: "upholstered-bed",
      href: "https://www.instagram.com/hometrends.ennis/",
      image: "/media/editorial/from-shop-mink.jpg",
      alt: "An upholstered bed, dressed",
    },
  ],
  hoursWeek: "Mon–Sat 09:30–18:00",
  hoursSunday: "Sunday closed",
  hoursBank: "Bank holidays 13:00–17:00",
  hoursShort: "Mon–Sat 09:30–18:00 · Sunday closed",
} as const;

export const HOURS = [
  { day: "Monday–Saturday", time: "09:30–18:00" },
  { day: "Sunday", time: "Closed" },
  { day: "Bank holidays", time: "13:00–17:00" },
] as const;

/** Amounts are integer cents throughout; they are divided only to format. */
export function euro(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
