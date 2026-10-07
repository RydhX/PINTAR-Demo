/* Satu-satunya sumber data PINTAR */
const AREA_SVG = "assets/Area77_DraftTata.svg";

const DATA = {
  buildings: [
    {
      id: "GKP",
      name: "Gedung Kantor Pusat",
      active: true,
      // GANTI dengan id polygon gedung ini di Area77_DraftTata.svg
      polygonId: "GD_GKP",
      floors: [
        {
          id: "L2",
          name: "Lantai 2",
          svg: "assets/GKP_LT_2_DraftTata.svg",
          rooms: {
            L2_R01:  { tenant: "Available", status: "vacant", payment: "-" },
            L2_R02:  { tenant: "PT TRI LINTANG MANDIRI", status: "occupied", payment: "Lunas" },
            L2_R03:  { tenant: "Available", status: "vacant", payment: "-" },
            L2_R04:  { tenant: "PT IBP", status: "occupied", payment: "Lunas" },
            L2_R05:  { tenant: "PT INTEN", status: "occupied", payment: "Lunas" },
            L2_R05B: { tenant: "Available", status: "vacant", payment: "-" },
            L2_R06:  { tenant: "SHOWROOM PT INTI", status: "occupied", payment: "Lunas" },
            L2_R07:  { tenant: "PT KAU", status: "occupied", payment: "Belum bayar" },
            L2_R08:  { tenant: "Available", status: "vacant", payment: "-" },
            L2_R09:  { tenant: "Available", status: "vacant", payment: "-" },
            L2_R10:  { tenant: "Data Centre & Gudang AOD", status: "occupied", payment: "Lunas" }
          }
        }
      ]
    }
  ]
};