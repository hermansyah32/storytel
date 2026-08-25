const INDONESIA_CITIES = [
  // Aceh
  { name: 'Banda Aceh', province: 'Aceh', lat: 5.5483, lon: 95.3238 },
  { name: 'Lhokseumawe', province: 'Aceh', lat: 5.1801, lon: 97.1407 },
  { name: 'Langsa', province: 'Aceh', lat: 4.4683, lon: 97.9683 },

  // Sumatera Utara
  { name: 'Medan', province: 'Sumatera Utara', lat: 3.5952, lon: 98.6722 },
  { name: 'Pematangsiantar', province: 'Sumatera Utara', lat: 2.9708, lon: 99.0682 },
  { name: 'Binjai', province: 'Sumatera Utara', lat: 3.6001, lon: 98.4854 },

  // Sumatera Barat
  { name: 'Padang', province: 'Sumatera Barat', lat: -0.9471, lon: 100.4172 },
  { name: 'Bukittinggi', province: 'Sumatera Barat', lat: -0.3056, lon: 100.3692 },
  { name: 'Payakumbuh', province: 'Sumatera Barat', lat: -0.2248, lon: 100.6318 },

  // Riau
  { name: 'Pekanbaru', province: 'Riau', lat: 0.5071, lon: 101.4478 },
  { name: 'Dumai', province: 'Riau', lat: 1.6744, lon: 101.4497 },
  { name: 'Duri', province: 'Riau', lat: 1.2721, lon: 101.2163 },

  // Kepulauan Riau
  { name: 'Tanjungpinang', province: 'Kepulauan Riau', lat: 0.9167, lon: 104.4500 },
  { name: 'Batam', province: 'Kepulauan Riau', lat: 1.1301, lon: 104.0529 },
  { name: 'Tanjung Balai Karimun', province: 'Kepulauan Riau', lat: 0.9833, lon: 103.4333 },

  // Jambi
  { name: 'Jambi', province: 'Jambi', lat: -1.6101, lon: 103.6131 },
  { name: 'Sungai Penuh', province: 'Jambi', lat: -2.0607, lon: 101.3934 },
  { name: 'Muara Bulian', province: 'Jambi', lat: -1.7275, lon: 103.2847 },

  // Sumatera Selatan
  { name: 'Palembang', province: 'Sumatera Selatan', lat: -2.9761, lon: 104.7754 },
  { name: 'Prabumulih', province: 'Sumatera Selatan', lat: -3.4300, lon: 104.2300 },
  { name: 'Lubuklinggau', province: 'Sumatera Selatan', lat: -3.2958, lon: 102.8606 },

  // Bengkulu
  { name: 'Bengkulu', province: 'Bengkulu', lat: -3.7928, lon: 102.2608 },
  { name: 'Curup', province: 'Bengkulu', lat: -3.4667, lon: 102.5167 },
  { name: 'Manna', province: 'Bengkulu', lat: -4.4744, lon: 102.9031 },

  // Lampung
  { name: 'Bandar Lampung', province: 'Lampung', lat: -5.4500, lon: 105.2667 },
  { name: 'Metro', province: 'Lampung', lat: -5.1131, lon: 105.3069 },
  { name: 'Kotabumi', province: 'Lampung', lat: -4.8258, lon: 104.8864 },

  // Bangka Belitung
  { name: 'Pangkalpinang', province: 'Kepulauan Bangka Belitung', lat: -2.1333, lon: 106.1167 },
  { name: 'Tanjung Pandan', province: 'Kepulauan Bangka Belitung', lat: -2.7333, lon: 107.6500 },
  { name: 'Sungailiat', province: 'Kepulauan Bangka Belitung', lat: -1.8569, lon: 106.1158 },

  // DKI Jakarta
  { name: 'Jakarta Pusat', province: 'DKI Jakarta', lat: -6.1805, lon: 106.8284 },
  { name: 'Jakarta Selatan', province: 'DKI Jakarta', lat: -6.2615, lon: 106.8106 },
  { name: 'Jakarta Barat', province: 'DKI Jakarta', lat: -6.1683, lon: 106.7589 },

  // Jawa Barat
  { name: 'Bandung', province: 'Jawa Barat', lat: -6.9175, lon: 107.6191 },
  { name: 'Bekasi', province: 'Jawa Barat', lat: -6.2383, lon: 106.9756 },
  { name: 'Depok', province: 'Jawa Barat', lat: -6.4025, lon: 106.7942 },

  // Jawa Tengah
  { name: 'Semarang', province: 'Jawa Tengah', lat: -6.9667, lon: 110.4167 },
  { name: 'Surakarta (Solo)', province: 'Jawa Tengah', lat: -7.5755, lon: 110.8243 },
  { name: 'Magelang', province: 'Jawa Tengah', lat: -7.4797, lon: 110.2177 },

  // DI Yogyakarta
  { name: 'Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { name: 'Sleman', province: 'DI Yogyakarta', lat: -7.7156, lon: 110.3556 },
  { name: 'Bantul', province: 'DI Yogyakarta', lat: -7.8878, lon: 110.3289 },

  // Jawa Timur
  { name: 'Surabaya', province: 'Jawa Timur', lat: -7.2575, lon: 112.7521 },
  { name: 'Malang', province: 'Jawa Timur', lat: -7.9666, lon: 112.6326 },
  { name: 'Kediri', province: 'Jawa Timur', lat: -7.8480, lon: 112.0178 },

  // Banten
  { name: 'Serang', province: 'Banten', lat: -6.1200, lon: 106.1500 },
  { name: 'Tangerang', province: 'Banten', lat: -6.1783, lon: 106.6300 },
  { name: 'Cilegon', province: 'Banten', lat: -6.0174, lon: 106.0538 },

  // Bali
  { name: 'Denpasar', province: 'Bali', lat: -8.6705, lon: 115.2126 },
  { name: 'Singaraja', province: 'Bali', lat: -8.1120, lon: 115.0882 },
  { name: 'Ubud', province: 'Bali', lat: -8.5069, lon: 115.2625 },

  // Nusa Tenggara Barat
  { name: 'Mataram', province: 'Nusa Tenggara Barat', lat: -8.5833, lon: 116.1167 },
  { name: 'Bima', province: 'Nusa Tenggara Barat', lat: -8.4608, lon: 118.7256 },
  { name: 'Praya', province: 'Nusa Tenggara Barat', lat: -8.7067, lon: 116.2708 },

  // Nusa Tenggara Timur
  { name: 'Kupang', province: 'Nusa Tenggara Timur', lat: -10.1772, lon: 123.6070 },
  { name: 'Ende', province: 'Nusa Tenggara Timur', lat: -8.8383, lon: 121.6558 },
  { name: 'Labuan Bajo', province: 'Nusa Tenggara Timur', lat: -8.4964, lon: 119.8877 },

  // Kalimantan Barat
  { name: 'Pontianak', province: 'Kalimantan Barat', lat: -0.0263, lon: 109.3425 },
  { name: 'Singkawang', province: 'Kalimantan Barat', lat: 0.9083, lon: 108.9833 },
  { name: 'Ketapang', province: 'Kalimantan Barat', lat: -1.8483, lon: 109.9733 },

  // Kalimantan Tengah
  { name: 'Palangka Raya', province: 'Kalimantan Tengah', lat: -2.2100, lon: 113.9200 },
  { name: 'Sampit', province: 'Kalimantan Tengah', lat: -2.5333, lon: 112.9500 },
  { name: 'Pangkalan Bun', province: 'Kalimantan Tengah', lat: -2.6833, lon: 111.6167 },

  // Kalimantan Selatan
  { name: 'Banjarbaru', province: 'Kalimantan Selatan', lat: -3.4400, lon: 114.8300 },
  { name: 'Banjarmasin', province: 'Kalimantan Selatan', lat: -3.3194, lon: 114.5908 },
  { name: 'Martapura', province: 'Kalimantan Selatan', lat: -3.4167, lon: 114.8500 },

  // Kalimantan Timur
  { name: 'Samarinda', province: 'Kalimantan Timur', lat: -0.5022, lon: 117.1536 },
  { name: 'Balikpapan', province: 'Kalimantan Timur', lat: -1.2379, lon: 116.8529 },
  { name: 'Bontang', province: 'Kalimantan Timur', lat: 0.1333, lon: 117.5000 },

  // Kalimantan Utara
  { name: 'Tanjung Selor', province: 'Kalimantan Utara', lat: 2.8375, lon: 117.3653 },
  { name: 'Tarakan', province: 'Kalimantan Utara', lat: 3.3000, lon: 117.6333 },
  { name: 'Nunukan', province: 'Kalimantan Utara', lat: 4.1333, lon: 117.6500 },

  // Sulawesi Utara
  { name: 'Manado', province: 'Sulawesi Utara', lat: 1.4748, lon: 124.8428 },
  { name: 'Bitung', province: 'Sulawesi Utara', lat: 1.4451, lon: 125.1889 },
  { name: 'Tomohon', province: 'Sulawesi Utara', lat: 1.3308, lon: 124.8383 },

  // Sulawesi Tengah
  { name: 'Palu', province: 'Sulawesi Tengah', lat: -0.8986, lon: 119.8707 },
  { name: 'Luwuk', province: 'Sulawesi Tengah', lat: -0.9516, lon: 122.7875 },
  { name: 'Poso', province: 'Sulawesi Tengah', lat: -1.3958, lon: 120.7525 },

  // Sulawesi Selatan
  { name: 'Makassar', province: 'Sulawesi Selatan', lat: -5.1477, lon: 119.4327 },
  { name: 'Parepare', province: 'Sulawesi Selatan', lat: -4.0133, lon: 119.6247 },
  { name: 'Palopo', province: 'Sulawesi Selatan', lat: -2.9942, lon: 120.1969 },

  // Sulawesi Tenggara
  { name: 'Kendari', province: 'Sulawesi Tenggara', lat: -3.9985, lon: 122.5126 },
  { name: 'Baubau', province: 'Sulawesi Tenggara', lat: -5.4667, lon: 122.6000 },
  { name: 'Kolaka', province: 'Sulawesi Tenggara', lat: -4.0533, lon: 121.6025 },

  // Gorontalo
  { name: 'Gorontalo', province: 'Gorontalo', lat: 0.5435, lon: 123.0568 },
  { name: 'Limboto', province: 'Gorontalo', lat: 0.6272, lon: 122.9822 },
  { name: 'Marisa', province: 'Gorontalo', lat: 0.4611, lon: 121.9386 },

  // Sulawesi Barat
  { name: 'Mamuju', province: 'Sulawesi Barat', lat: -2.6775, lon: 118.8872 },
  { name: 'Polewali', province: 'Sulawesi Barat', lat: -3.4325, lon: 119.3425 },
  { name: 'Majene', province: 'Sulawesi Barat', lat: -3.5403, lon: 118.9722 },

  // Maluku
  { name: 'Ambon', province: 'Maluku', lat: -3.6954, lon: 128.1814 },
  { name: 'Tual', province: 'Maluku', lat: -5.6294, lon: 132.7514 },
  { name: 'Masohi', province: 'Maluku', lat: -3.2944, lon: 128.9567 },

  // Maluku Utara
  { name: 'Sofifi', province: 'Maluku Utara', lat: 0.7408, lon: 127.5614 },
  { name: 'Ternate', province: 'Maluku Utara', lat: 0.7906, lon: 127.3800 },
  { name: 'Tidore', province: 'Maluku Utara', lat: 0.6867, lon: 127.4069 },

  // Papua
  { name: 'Jayapura', province: 'Papua', lat: -2.5414, lon: 140.7067 },
  { name: 'Sentani', province: 'Papua', lat: -2.5647, lon: 140.5161 },
  { name: 'Biak', province: 'Papua', lat: -1.1758, lon: 136.0828 },

  // Papua Barat
  { name: 'Manokwari', province: 'Papua Barat', lat: -0.8614, lon: 134.0620 },
  { name: 'Sorong Kota', province: 'Papua Barat', lat: -0.8762, lon: 131.2558 },
  { name: 'Fakfak', province: 'Papua Barat', lat: -2.9264, lon: 132.2969 },

  // Papua Selatan
  { name: 'Merauke', province: 'Papua Selatan', lat: -8.4991, lon: 140.4047 },
  { name: 'Tanah Merah', province: 'Papua Selatan', lat: -5.6792, lon: 140.3017 },
  { name: 'Agats', province: 'Papua Selatan', lat: -5.5414, lon: 138.1369 },

  // Papua Tengah
  { name: 'Nabire', province: 'Papua Tengah', lat: -3.3686, lon: 135.4850 },
  { name: 'Timika', province: 'Papua Tengah', lat: -4.5447, lon: 136.8886 },
  { name: 'Enarotali', province: 'Papua Tengah', lat: -3.9214, lon: 136.3533 },

  // Papua Pegunungan
  { name: 'Wamena', province: 'Papua Pegunungan', lat: -4.0983, lon: 138.9442 },
  { name: 'Tiom', province: 'Papua Pegunungan', lat: -3.8822, lon: 138.4556 },
  { name: 'Dekai', province: 'Papua Pegunungan', lat: -4.8617, lon: 139.4806 },

  // Papua Barat Daya
  { name: 'Sorong', province: 'Papua Barat Daya', lat: -0.8762, lon: 131.2558 },
  { name: 'Teminabuan', province: 'Papua Barat Daya', lat: -1.4422, lon: 132.0164 },
  { name: 'Kaimana', province: 'Papua Barat Daya', lat: -3.6558, lon: 133.7708 },
];

export default INDONESIA_CITIES;
