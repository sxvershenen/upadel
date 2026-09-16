// Central image manifest — swap URLs here to replace imagery site-wide.
const px = (id: number, w: number, h: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const images = {
  hero: px(38090725, 1920, 1400),

  benefitsLounge: px(26626726, 1400, 1100),
  benefitsShower: px(34079998, 1200, 1400),
  benefitsChill: px(26626726, 1400, 1100),
  benefitsKids: px(34399237, 1200, 1400),

  offerTournament: px(38028147, 1600, 900),
  offerEvent: px(34079544, 1600, 900),

  courtsBg: px(35248404, 2200, 1400),

  trainingIndividual: px(38347564, 1200, 1500),
  trainingGroup: px(35248404, 1200, 1500),
  trainingKids: px(8224496, 1200, 1500),

  coach1: px(35248259, 900, 1100),
  coach2: px(35248253, 900, 1100),
  coach3: px(38690521, 900, 1100),
  coach4: px(35248266, 900, 1100),
  coach5: px(38575893, 900, 1100),
  coach6: px(35248269, 900, 1100),

  tournamentParty: px(9654729, 1000, 1300),

  gallery: [
    px(34079995, 900, 900),
    px(34079997, 900, 900),
    px(34080002, 900, 900),
    px(34079410, 900, 900),
    px(34079544, 900, 900),
    px(34080009, 900, 900),
    px(34079996, 900, 900),
    px(34080007, 900, 900),
    px(37978999, 900, 900),
    px(31519042, 900, 900),
  ],

  blog1: px(4920425, 1000, 750),
  blog2: px(3926934, 1000, 750),
  blog3: px(5310723, 1000, 750),

  footerClub: px(33095509, 1200, 1400),

  reviewAvatars: [
    px(34079544, 200, 200),
    px(34079995, 200, 200),
    px(34080009, 200, 200),
    px(34079996, 200, 200),
    px(34080007, 200, 200),
    px(37978999, 200, 200),
  ],
};
