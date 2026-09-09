export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/place//data=!4m4!3m3!1s0x485b12d2ce9f2f77:0xcf6c3c48c9b00201!9m1!1b1";

/* Phase 2. Gemma Casey's review leads: it is the only one that names a
   concrete saving against a named alternative and ends on "shop local". The
   three shown on the homepage are REVIEWS.slice(0, 3); order is the only thing
   changed here, no wording and no ratings. */
export const REVIEWS = [
  {
    name: "Gemma Casey",
    initials: "GC",
    source: "Google",
    sourceUrl: GOOGLE_REVIEWS_URL,
    stars: 5,
    when: "5 months ago",
    text: "I bought a storage bed & linen from here. Fantastic & efficient service. Quality was superb & the delivery men assembled it for me & took away all the packaging. Id been let down badly with damaged goods from a big chain store in Limerick. The bed i have now is better quality & €400 cheaper. It was definitely a lesson learned. Shop local !!",
  },
  {
    name: "Tomasz Kotowski",
    initials: "TK",
    source: "Google",
    sourceUrl: GOOGLE_REVIEWS_URL,
    stars: 5,
    when: "3 weeks ago",
    text: "Great customer service. Beds, mattress, wardrobes, table, we're delivered in excellent service. We are delighted of their hard work, polite, kind, and nice treatment. Once again we are very happy of being their customers and the part of Home Trends World.",
  },
  {
    name: "Lisa McI",
    initials: "LM",
    source: "Google",
    sourceUrl: GOOGLE_REVIEWS_URL,
    stars: 5,
    when: "4 months ago",
    text: "Delighted with their service. Beds ordered and delivered within a week. Great selection and great value. A friend recommended Home Trends and am delighted to highly recommend them to all",
  },
  {
    name: "Caroline O'Brien",
    initials: "CO",
    source: "Google",
    sourceUrl: GOOGLE_REVIEWS_URL,
    stars: 5,
    when: "a year ago",
    text: "I recently purchased a Murphy bed from Home Trends, and I couldn't be happier with my experience. From start to finish, the service was exceptional. The bed itself is fantastic value for money. I have priced the bed in other places, and it is often twice or three times the cost. First, the selection process was easy. The showroom was well-organised, Eileen is incredibly knowledgeable and helpful. She guided me through various options, explaining the features and benefits of each Murphy bed style. The ordering process was smooth and straightforward. The team kept me informed at every step, ensuring that I knew when to expect my delivery. Delivery day was seamless. The delivery team arrived on time. They were professional, courteous, and efficient, ensuring that the installation was completed to perfection. As for the Murphy bed itself, it is fantastic! It has transformed my small space into a multifunctional room. The bed is comfortable, easy to operate, and looks great when folded up. Overall, I am extremely satisfied with my purchase and the service I received from Home Trends. I highly recommend them to anyone in need of high-quality furniture and exceptional customer service. Five stars all the way!",
  },
  {
    name: "Magda Chelstowska",
    initials: "MC",
    source: "Google",
    sourceUrl: GOOGLE_REVIEWS_URL,
    stars: 5,
    when: "2 years ago",
    text: "Very cute furniture store in the center of Ennis! Many unique pieces of furniture to choose from and it’s amazing how much can fit on two floors of this store. The staff were very friendly and attentive to our needs but also not pushy. Recommend!",
  },
] as const;
