// Base de datos completa de ubicaciones de Colombia
// Estructura: Departamento > Ciudad > Barrios/Corregimientos

export interface Barrio {
  id: string;
  name: string;
}

export interface Ciudad {
  id: string;
  name: string;
  barrios: Barrio[];
}

export interface Departamento {
  id: string;
  name: string;
  ciudades: Ciudad[];
}

export const COLOMBIA_LOCATIONS: Departamento[] = [
  {
    id: 'cundinamarca',
    name: 'Cundinamarca',
    ciudades: [
      {
        id: 'bogota',
        name: 'Bogotá D.C.',
        barrios: [
          { id: 'chapinero', name: 'Chapinero' },
          { id: 'usaquen', name: 'Usaquén' },
          { id: 'suba', name: 'Suba' },
          { id: 'kennedy', name: 'Kennedy' },
          { id: 'engativa', name: 'Engativá' },
          { id: 'fontibon', name: 'Fontibón' },
          { id: 'teusaquillo', name: 'Teusaquillo' },
          { id: 'barrios_unidos', name: 'Barrios Unidos' },
          { id: 'puente_aranda', name: 'Puente Aranda' },
          { id: 'antonio_narino', name: 'Antonio Nariño' },
          { id: 'rafael_uribe', name: 'Rafael Uribe Uribe' },
          { id: 'ciudad_bolivar', name: 'Ciudad Bolívar' },
          { id: 'bosa', name: 'Bosa' },
          { id: 'tunjuelito', name: 'Tunjuelito' },
          { id: 'san_cristobal', name: 'San Cristóbal' },
          { id: 'santa_fe', name: 'Santa Fe' },
          { id: 'la_candelaria', name: 'La Candelaria' },
          { id: 'los_martires', name: 'Los Mártires' },
          { id: 'usme', name: 'Usme' },
          { id: 'sumapaz', name: 'Sumapaz' }
        ]
      },
      {
        id: 'soacha',
        name: 'Soacha',
        barrios: [
          { id: 'compartir', name: 'Compartir' },
          { id: 'san_mateo', name: 'San Mateo' },
          { id: 'leon_xiii', name: 'León XIII' },
          { id: 'cazuca', name: 'Cazucá' },
          { id: 'ciudadela_sucre', name: 'Ciudadela Sucre' },
          { id: 'tierra_blanca', name: 'Tierra Blanca' },
          { id: 'san_humberto', name: 'San Humberto' },
          { id: 'el_soli', name: 'El Soli' },
          { id: 'la_despensa', name: 'La Despensa' },
          { id: 'portalegre', name: 'Portalegre' }
        ]
      },
      {
        id: 'chia',
        name: 'Chía',
        barrios: [
          { id: 'centro_chia', name: 'Centro' },
          { id: 'la_balsa', name: 'La Balsa' },
          { id: 'fagua', name: 'Fagua' },
          { id: 'fonqueta', name: 'Fonqueta' },
          { id: 'yerbabuena', name: 'Yerbabuena' }
        ]
      },
      {
        id: 'zipaquira',
        name: 'Zipaquirá',
        barrios: [
          { id: 'centro_zipa', name: 'Centro' },
          { id: 'algarra', name: 'Algarra' },
          { id: 'san_rafael', name: 'San Rafael' },
          { id: 'julio_caro', name: 'Julio Caro' }
        ]
      },
      {
        id: 'fusagasuga',
        name: 'Fusagasugá',
        barrios: [
          { id: 'centro_fusa', name: 'Centro' },
          { id: 'comuneros', name: 'Comuneros' },
          { id: 'la_macarena', name: 'La Macarena' },
          { id: 'pekín', name: 'Pekín' }
        ]
      },
      {
        id: 'girardot',
        name: 'Girardot',
        barrios: [
          { id: 'centro_girardot', name: 'Centro' },
          { id: 'la_estacion', name: 'La Estación' },
          { id: 'miraflores', name: 'Miraflores' },
          { id: 'alto_rosario', name: 'Alto del Rosario' }
        ]
      },
      {
        id: 'facatativa',
        name: 'Facatativá',
        barrios: [
          { id: 'centro_faca', name: 'Centro' },
          { id: 'cartagenita', name: 'Cartagenita' },
          { id: 'santa_marta', name: 'Santa Marta' }
        ]
      },
      {
        id: 'mosquera',
        name: 'Mosquera',
        barrios: [
          { id: 'centro_mosquera', name: 'Centro' },
          { id: 'el_porvenir', name: 'El Porvenir' },
          { id: 'la_ciudadela', name: 'La Ciudadela' }
        ]
      },
      {
        id: 'madrid',
        name: 'Madrid',
        barrios: [
          { id: 'centro_madrid', name: 'Centro' },
          { id: 'sosiego', name: 'Sosiego' },
          { id: 'serrezuela', name: 'Serrezuela' }
        ]
      }
    ]
  },
  {
    id: 'antioquia',
    name: 'Antioquia',
    ciudades: [
      {
        id: 'medellin',
        name: 'Medellín',
        barrios: [
          { id: 'poblado', name: 'El Poblado' },
          { id: 'laureles', name: 'Laureles' },
          { id: 'belen', name: 'Belén' },
          { id: 'envigado', name: 'Envigado' },
          { id: 'sabaneta', name: 'Sabaneta' },
          { id: 'itagui', name: 'Itagüí' },
          { id: 'la_estrella', name: 'La Estrella' },
          { id: 'robledo', name: 'Robledo' },
          { id: 'castilla', name: 'Castilla' },
          { id: 'aranjuez', name: 'Aranjuez' },
          { id: 'manrique', name: 'Manrique' },
          { id: 'buenos_aires', name: 'Buenos Aires' },
          { id: 'la_candelaria_med', name: 'La Candelaria' },
          { id: 'guayabal', name: 'Guayabal' },
          { id: 'estadio', name: 'Estadio' },
          { id: 'floresta', name: 'Floresta' },
          { id: 'calasanz', name: 'Calasanz' },
          { id: 'santa_monica', name: 'Santa Mónica' }
        ]
      },
      {
        id: 'bello',
        name: 'Bello',
        barrios: [
          { id: 'niquia', name: 'Niquía' },
          { id: 'centro_bello', name: 'Centro' },
          { id: 'zamora', name: 'Zamora' },
          { id: 'paris', name: 'París' }
        ]
      },
      {
        id: 'rionegro',
        name: 'Rionegro',
        barrios: [
          { id: 'centro_rionegro', name: 'Centro' },
          { id: 'gualanday', name: 'Gualanday' },
          { id: 'san_antonio', name: 'San Antonio' }
        ]
      },
      {
        id: 'apartado',
        name: 'Apartadó',
        barrios: [
          { id: 'centro_apartado', name: 'Centro' },
          { id: 'ortiz', name: 'Ortiz' },
          { id: 'obrero', name: 'Obrero' }
        ]
      },
      {
        id: 'turbo',
        name: 'Turbo',
        barrios: [
          { id: 'centro_turbo', name: 'Centro' },
          { id: 'julia', name: 'Julia' },
          { id: 'pescador', name: 'Pescador' }
        ]
      }
    ]
  },
  {
    id: 'valle_del_cauca',
    name: 'Valle del Cauca',
    ciudades: [
      {
        id: 'cali',
        name: 'Cali',
        barrios: [
          { id: 'granada', name: 'Granada' },
          { id: 'ciudad_jardin', name: 'Ciudad Jardín' },
          { id: 'san_fernando', name: 'San Fernando' },
          { id: 'tequendama', name: 'Tequendama' },
          { id: 'santa_rita', name: 'Santa Rita' },
          { id: 'el_ingenio', name: 'El Ingenio' },
          { id: 'valle_lili', name: 'Valle del Lilí' },
          { id: 'pampalinda', name: 'Pampalinda' },
          { id: 'la_flora', name: 'La Flora' },
          { id: 'versalles', name: 'Versalles' },
          { id: 'aguablanca', name: 'Aguablanca' },
          { id: 'siloé', name: 'Siloé' },
          { id: 'alfonso_lopez', name: 'Alfonso López' },
          { id: 'la_base', name: 'La Base' }
        ]
      },
      {
        id: 'buenaventura',
        name: 'Buenaventura',
        barrios: [
          { id: 'centro_buenaventura', name: 'Centro' },
          { id: 'cascajal', name: 'Cascajal' },
          { id: 'rockefeller', name: 'Rockefeller' }
        ]
      },
      {
        id: 'palmira',
        name: 'Palmira',
        barrios: [
          { id: 'centro_palmira', name: 'Centro' },
          { id: 'las_mercedes', name: 'Las Mercedes' },
          { id: 'zamorano', name: 'Zamorano' }
        ]
      },
      {
        id: 'tulua',
        name: 'Tuluá',
        barrios: [
          { id: 'centro_tulua', name: 'Centro' },
          { id: 'farfan', name: 'Farfán' },
          { id: 'victoria', name: 'Victoria' }
        ]
      },
      {
        id: 'cartago',
        name: 'Cartago',
        barrios: [
          { id: 'centro_cartago', name: 'Centro' },
          { id: 'santa_ana', name: 'Santa Ana' }
        ]
      }
    ]
  },
  {
    id: 'atlantico',
    name: 'Atlántico',
    ciudades: [
      {
        id: 'barranquilla',
        name: 'Barranquilla',
        barrios: [
          { id: 'alto_prado', name: 'Alto Prado' },
          { id: 'el_prado', name: 'El Prado' },
          { id: 'villa_country', name: 'Villa Country' },
          { id: 'riomar', name: 'Riomar' },
          { id: 'ciudad_jardin_baq', name: 'Ciudad Jardín' },
          { id: 'el_golf', name: 'El Golf' },
          { id: 'boston', name: 'Boston' },
          { id: 'centro_baq', name: 'Centro' },
          { id: 'modelo', name: 'Modelo' },
          { id: 'san_francisco', name: 'San Francisco' },
          { id: 'la_victoria', name: 'La Victoria' },
          { id: 'rebolo', name: 'Rebolo' },
          { id: 'las_nieves', name: 'Las Nieves' },
          { id: 'suroccidente', name: 'Suroccidente' }
        ]
      },
      {
        id: 'soledad',
        name: 'Soledad',
        barrios: [
          { id: 'centro_soledad', name: 'Centro' },
          { id: 'hipódromo', name: 'Hipódromo' },
          { id: 'villa_sol', name: 'Villa Sol' },
          { id: 'las_moras', name: 'Las Moras' }
        ]
      },
      {
        id: 'malambo',
        name: 'Malambo',
        barrios: [
          { id: 'centro_malambo', name: 'Centro' },
          { id: 'concord', name: 'Concord' }
        ]
      }
    ]
  },
  {
    id: 'bolivar',
    name: 'Bolívar',
    ciudades: [
      {
        id: 'cartagena',
        name: 'Cartagena',
        barrios: [
          { id: 'bocagrande', name: 'Bocagrande' },
          { id: 'castillogrande', name: 'Castillogrande' },
          { id: 'laguito', name: 'Laguito' },
          { id: 'manga', name: 'Manga' },
          { id: 'getsemani', name: 'Getsemaní' },
          { id: 'centro_historico', name: 'Centro Histórico' },
          { id: 'san_diego', name: 'San Diego' },
          { id: 'crespo', name: 'Crespo' },
          { id: 'cabrero', name: 'Cabrero' },
          { id: 'pie_popa', name: 'Pie de la Popa' },
          { id: 'torices', name: 'Torices' },
          { id: 'la_boquilla', name: 'La Boquilla' },
          { id: 'olaya', name: 'Olaya' },
          { id: 'nelson_mandela', name: 'Nelson Mandela' }
        ]
      },
      {
        id: 'magangue',
        name: 'Magangué',
        barrios: [
          { id: 'centro_magangue', name: 'Centro' },
          { id: 'versalles_mag', name: 'Versalles' }
        ]
      },
      {
        id: 'turbaco',
        name: 'Turbaco',
        barrios: [
          { id: 'centro_turbaco', name: 'Centro' },
          { id: 'cañaveral', name: 'Cañaveral' }
        ]
      }
    ]
  },
  {
    id: 'santander',
    name: 'Santander',
    ciudades: [
      {
        id: 'bucaramanga',
        name: 'Bucaramanga',
        barrios: [
          { id: 'cabecera', name: 'Cabecera' },
          { id: 'sotomayor', name: 'Sotomayor' },
          { id: 'centro_bga', name: 'Centro' },
          { id: 'la_concordia', name: 'La Concordia' },
          { id: 'provenza', name: 'Provenza' },
          { id: 'san_alonso', name: 'San Alonso' },
          { id: 'alarcon', name: 'Alarcón' },
          { id: 'real_minas', name: 'Real de Minas' },
          { id: 'ciudadela_bga', name: 'Ciudadela' },
          { id: 'florida', name: 'Florida' }
        ]
      },
      {
        id: 'floridablanca',
        name: 'Floridablanca',
        barrios: [
          { id: 'cañaveral_florida', name: 'Cañaveral' },
          { id: 'lagos', name: 'Lagos' },
          { id: 'centro_florida', name: 'Centro' }
        ]
      },
      {
        id: 'giron',
        name: 'Girón',
        barrios: [
          { id: 'centro_giron', name: 'Centro' },
          { id: 'rio_prado', name: 'Río Prado' }
        ]
      },
      {
        id: 'piedecuesta',
        name: 'Piedecuesta',
        barrios: [
          { id: 'centro_piedecuesta', name: 'Centro' },
          { id: 'pintada', name: 'La Pintada' }
        ]
      },
      {
        id: 'barrancabermeja',
        name: 'Barrancabermeja',
        barrios: [
          { id: 'centro_barranca', name: 'Centro' },
          { id: 'colombia', name: 'Colombia' },
          { id: 'galán', name: 'Galán' }
        ]
      }
    ]
  },
  {
    id: 'norte_santander',
    name: 'Norte de Santander',
    ciudades: [
      {
        id: 'cucuta',
        name: 'Cúcuta',
        barrios: [
          { id: 'centro_cucuta', name: 'Centro' },
          { id: 'caobos', name: 'Caobos' },
          { id: 'prados_norte', name: 'Prados del Norte' },
          { id: 'la_riviera', name: 'La Riviera' },
          { id: 'san_luis', name: 'San Luis' },
          { id: 'guaimaral', name: 'Guaimaral' },
          { id: 'atalaya', name: 'Atalaya' }
        ]
      },
      {
        id: 'ocana',
        name: 'Ocaña',
        barrios: [
          { id: 'centro_ocana', name: 'Centro' },
          { id: 'cristo_rey', name: 'Cristo Rey' }
        ]
      },
      {
        id: 'pamplona',
        name: 'Pamplona',
        barrios: [
          { id: 'centro_pamplona', name: 'Centro' },
          { id: 'juan_xxiii', name: 'Juan XXIII' }
        ]
      }
    ]
  },
  {
    id: 'magdalena',
    name: 'Magdalena',
    ciudades: [
      {
        id: 'santa_marta',
        name: 'Santa Marta',
        barrios: [
          { id: 'rodadero', name: 'El Rodadero' },
          { id: 'bello_horizonte', name: 'Bello Horizonte' },
          { id: 'centro_sm', name: 'Centro' },
          { id: 'taganga', name: 'Taganga' },
          { id: 'pozos_colorados', name: 'Pozos Colorados' },
          { id: 'mamatoco', name: 'Mamatoco' },
          { id: 'gaira', name: 'Gaira' },
          { id: 'minca', name: 'Minca' }
        ]
      },
      {
        id: 'cienaga',
        name: 'Ciénaga',
        barrios: [
          { id: 'centro_cienaga', name: 'Centro' },
          { id: 'kennedy_cienaga', name: 'Kennedy' }
        ]
      }
    ]
  },
  {
    id: 'risaralda',
    name: 'Risaralda',
    ciudades: [
      {
        id: 'pereira',
        name: 'Pereira',
        barrios: [
          { id: 'centro_pereira', name: 'Centro' },
          { id: 'circunvalar', name: 'Circunvalar' },
          { id: 'alamos', name: 'Álamos' },
          { id: 'pinares', name: 'Pinares' },
          { id: 'cuba', name: 'Cuba' },
          { id: 'dosquebradas', name: 'Dosquebradas' },
          { id: 'cerritos', name: 'Cerritos' }
        ]
      },
      {
        id: 'dosquebradas',
        name: 'Dosquebradas',
        barrios: [
          { id: 'centro_dosquebradas', name: 'Centro' },
          { id: 'campestre', name: 'Campestre' }
        ]
      },
      {
        id: 'santa_rosa',
        name: 'Santa Rosa de Cabal',
        barrios: [
          { id: 'centro_santa_rosa', name: 'Centro' },
          { id: 'termales', name: 'Termales' }
        ]
      }
    ]
  },
  {
    id: 'quindio',
    name: 'Quindío',
    ciudades: [
      {
        id: 'armenia',
        name: 'Armenia',
        barrios: [
          { id: 'centro_armenia', name: 'Centro' },
          { id: 'norte_armenia', name: 'Norte' },
          { id: 'laureles_armenia', name: 'Laureles' },
          { id: 'la_patria', name: 'La Patria' },
          { id: 'fundadores', name: 'Fundadores' }
        ]
      },
      {
        id: 'calarca',
        name: 'Calarcá',
        barrios: [
          { id: 'centro_calarca', name: 'Centro' },
          { id: 'la_virginia', name: 'La Virginia' }
        ]
      },
      {
        id: 'montenegro',
        name: 'Montenegro',
        barrios: [
          { id: 'centro_montenegro', name: 'Centro' },
          { id: 'parque_cafe', name: 'Parque del Café' }
        ]
      }
    ]
  },
  {
    id: 'caldas',
    name: 'Caldas',
    ciudades: [
      {
        id: 'manizales',
        name: 'Manizales',
        barrios: [
          { id: 'centro_manizales', name: 'Centro' },
          { id: 'chipre', name: 'Chipre' },
          { id: 'palermo', name: 'Palermo' },
          { id: 'milan', name: 'Milán' },
          { id: 'la_enea', name: 'La Enea' },
          { id: 'palogrande', name: 'Palogrande' },
          { id: 'estrella', name: 'Estrella' }
        ]
      },
      {
        id: 'la_dorada',
        name: 'La Dorada',
        barrios: [
          { id: 'centro_dorada', name: 'Centro' },
          { id: 'las_ferias', name: 'Las Ferias' }
        ]
      },
      {
        id: 'chinchina',
        name: 'Chinchiná',
        barrios: [
          { id: 'centro_chinchina', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'tolima',
    name: 'Tolima',
    ciudades: [
      {
        id: 'ibague',
        name: 'Ibagué',
        barrios: [
          { id: 'centro_ibague', name: 'Centro' },
          { id: 'jordan', name: 'Jordán' },
          { id: 'vergel', name: 'Vergel' },
          { id: 'salado', name: 'Salado' },
          { id: 'la_pola', name: 'La Pola' },
          { id: 'la_francia', name: 'La Francia' }
        ]
      },
      {
        id: 'espinal',
        name: 'Espinal',
        barrios: [
          { id: 'centro_espinal', name: 'Centro' },
          { id: 'balcones', name: 'Balcones' }
        ]
      },
      {
        id: 'melgar',
        name: 'Melgar',
        barrios: [
          { id: 'centro_melgar', name: 'Centro' },
          { id: 'el_penon', name: 'El Peñón' }
        ]
      }
    ]
  },
  {
    id: 'huila',
    name: 'Huila',
    ciudades: [
      {
        id: 'neiva',
        name: 'Neiva',
        barrios: [
          { id: 'centro_neiva', name: 'Centro' },
          { id: 'altico', name: 'Altico' },
          { id: 'canaima', name: 'Canaima' },
          { id: 'ipanema', name: 'Ipanema' },
          { id: 'santa_ines', name: 'Santa Inés' }
        ]
      },
      {
        id: 'pitalito',
        name: 'Pitalito',
        barrios: [
          { id: 'centro_pitalito', name: 'Centro' },
          { id: 'libertador', name: 'Libertador' }
        ]
      },
      {
        id: 'garzon',
        name: 'Garzón',
        barrios: [
          { id: 'centro_garzon', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'meta',
    name: 'Meta',
    ciudades: [
      {
        id: 'villavicencio',
        name: 'Villavicencio',
        barrios: [
          { id: 'centro_villavo', name: 'Centro' },
          { id: 'barzal', name: 'Barzal' },
          { id: 'la_grama', name: 'La Grama' },
          { id: 'caudal', name: 'Caudal' },
          { id: 'porfía', name: 'Porfía' },
          { id: 'popular', name: 'Popular' },
          { id: 'siete_agosto', name: '7 de Agosto' }
        ]
      },
      {
        id: 'acacias',
        name: 'Acacías',
        barrios: [
          { id: 'centro_acacias', name: 'Centro' },
          { id: 'bachue', name: 'Bachué' }
        ]
      },
      {
        id: 'granada_meta',
        name: 'Granada',
        barrios: [
          { id: 'centro_granada', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'casanare',
    name: 'Casanare',
    ciudades: [
      {
        id: 'yopal',
        name: 'Yopal',
        barrios: [
          { id: 'centro_yopal', name: 'Centro' },
          { id: 'el_morro', name: 'El Morro' },
          { id: 'la_campiña', name: 'La Campiña' },
          { id: 'brisas', name: 'Brisas' }
        ]
      },
      {
        id: 'aguazul',
        name: 'Aguazul',
        barrios: [
          { id: 'centro_aguazul', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'boyaca',
    name: 'Boyacá',
    ciudades: [
      {
        id: 'tunja',
        name: 'Tunja',
        barrios: [
          { id: 'centro_tunja', name: 'Centro' },
          { id: 'santa_ines_tunja', name: 'Santa Inés' },
          { id: 'hunza', name: 'Hunza' },
          { id: 'los_muiscas', name: 'Los Muiscas' }
        ]
      },
      {
        id: 'duitama',
        name: 'Duitama',
        barrios: [
          { id: 'centro_duitama', name: 'Centro' },
          { id: 'manzanares', name: 'Manzanares' }
        ]
      },
      {
        id: 'sogamoso',
        name: 'Sogamoso',
        barrios: [
          { id: 'centro_sogamoso', name: 'Centro' },
          { id: 'jorge_eliecer', name: 'Jorge Eliécer' }
        ]
      },
      {
        id: 'chiquinquira',
        name: 'Chiquinquirá',
        barrios: [
          { id: 'centro_chiquinquira', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'cesar',
    name: 'Cesar',
    ciudades: [
      {
        id: 'valledupar',
        name: 'Valledupar',
        barrios: [
          { id: 'centro_valledupar', name: 'Centro' },
          { id: 'novalito', name: 'Novalito' },
          { id: 'la_nevada', name: 'La Nevada' },
          { id: 'villa_del_rosario', name: 'Villa del Rosario' },
          { id: 'los_mayales', name: 'Los Mayales' }
        ]
      },
      {
        id: 'aguachica',
        name: 'Aguachica',
        barrios: [
          { id: 'centro_aguachica', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'la_guajira',
    name: 'La Guajira',
    ciudades: [
      {
        id: 'riohacha',
        name: 'Riohacha',
        barrios: [
          { id: 'centro_riohacha', name: 'Centro' },
          { id: 'el_muelle', name: 'El Muelle' },
          { id: 'coquivacoa', name: 'Coquivacoa' },
          { id: 'marbella', name: 'Marbella' }
        ]
      },
      {
        id: 'maicao',
        name: 'Maicao',
        barrios: [
          { id: 'centro_maicao', name: 'Centro' },
          { id: 'los_olivos', name: 'Los Olivos' }
        ]
      },
      {
        id: 'uribia',
        name: 'Uribia',
        barrios: [
          { id: 'centro_uribia', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'cordoba',
    name: 'Córdoba',
    ciudades: [
      {
        id: 'monteria',
        name: 'Montería',
        barrios: [
          { id: 'centro_monteria', name: 'Centro' },
          { id: 'la_castellana', name: 'La Castellana' },
          { id: 'recreo', name: 'Recreo' },
          { id: 'costa_oro', name: 'Costa de Oro' },
          { id: 'alamedas', name: 'Alamedas' }
        ]
      },
      {
        id: 'cerete',
        name: 'Cereté',
        barrios: [
          { id: 'centro_cerete', name: 'Centro' }
        ]
      },
      {
        id: 'lorica',
        name: 'Lorica',
        barrios: [
          { id: 'centro_lorica', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'sucre',
    name: 'Sucre',
    ciudades: [
      {
        id: 'sincelejo',
        name: 'Sincelejo',
        barrios: [
          { id: 'centro_sincelejo', name: 'Centro' },
          { id: 'venecia', name: 'Venecia' },
          { id: 'mochila', name: 'Mochila' },
          { id: 'la_ford', name: 'La Ford' }
        ]
      },
      {
        id: 'corozal',
        name: 'Corozal',
        barrios: [
          { id: 'centro_corozal', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'narino',
    name: 'Nariño',
    ciudades: [
      {
        id: 'pasto',
        name: 'Pasto',
        barrios: [
          { id: 'centro_pasto', name: 'Centro' },
          { id: 'avenida_boyaca', name: 'Av. Boyacá' },
          { id: 'villa_flor', name: 'Villa Flor' },
          { id: 'agualongo', name: 'Agualongo' },
          { id: 'palermo_pasto', name: 'Palermo' }
        ]
      },
      {
        id: 'tumaco',
        name: 'Tumaco',
        barrios: [
          { id: 'centro_tumaco', name: 'Centro' },
          { id: 'el_morro_tumaco', name: 'El Morro' }
        ]
      },
      {
        id: 'ipiales',
        name: 'Ipiales',
        barrios: [
          { id: 'centro_ipiales', name: 'Centro' },
          { id: 'las_lajas', name: 'Las Lajas' }
        ]
      }
    ]
  },
  {
    id: 'cauca',
    name: 'Cauca',
    ciudades: [
      {
        id: 'popayan',
        name: 'Popayán',
        barrios: [
          { id: 'centro_popayan', name: 'Centro Histórico' },
          { id: 'la_esmeralda', name: 'La Esmeralda' },
          { id: 'belen', name: 'Belén' },
          { id: 'yanaconas', name: 'Yanaconas' }
        ]
      },
      {
        id: 'santander_quilichao',
        name: 'Santander de Quilichao',
        barrios: [
          { id: 'centro_quilichao', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'choco',
    name: 'Chocó',
    ciudades: [
      {
        id: 'quibdo',
        name: 'Quibdó',
        barrios: [
          { id: 'centro_quibdo', name: 'Centro' },
          { id: 'alameda_reyes', name: 'Alameda Reyes' },
          { id: 'niño_jesus', name: 'Niño Jesús' }
        ]
      },
      {
        id: 'nuqui',
        name: 'Nuquí',
        barrios: [
          { id: 'centro_nuqui', name: 'Centro' }
        ]
      },
      {
        id: 'bahia_solano',
        name: 'Bahía Solano',
        barrios: [
          { id: 'centro_bahia', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'caqueta',
    name: 'Caquetá',
    ciudades: [
      {
        id: 'florencia',
        name: 'Florencia',
        barrios: [
          { id: 'centro_florencia', name: 'Centro' },
          { id: 'la_vega', name: 'La Vega' },
          { id: 'torasso', name: 'Torasso' }
        ]
      },
      {
        id: 'san_vicente',
        name: 'San Vicente del Caguán',
        barrios: [
          { id: 'centro_san_vicente', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'putumayo',
    name: 'Putumayo',
    ciudades: [
      {
        id: 'mocoa',
        name: 'Mocoa',
        barrios: [
          { id: 'centro_mocoa', name: 'Centro' },
          { id: 'villa_rosa', name: 'Villa Rosa' }
        ]
      },
      {
        id: 'puerto_asis',
        name: 'Puerto Asís',
        barrios: [
          { id: 'centro_puerto_asis', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'amazonas',
    name: 'Amazonas',
    ciudades: [
      {
        id: 'leticia',
        name: 'Leticia',
        barrios: [
          { id: 'centro_leticia', name: 'Centro' },
          { id: 'la_union', name: 'La Unión' },
          { id: 'victoria_regia', name: 'Victoria Regia' }
        ]
      }
    ]
  },
  {
    id: 'san_andres',
    name: 'San Andrés y Providencia',
    ciudades: [
      {
        id: 'san_andres_ciudad',
        name: 'San Andrés',
        barrios: [
          { id: 'centro_san_andres', name: 'Centro' },
          { id: 'north_end', name: 'North End' },
          { id: 'san_luis', name: 'San Luis' },
          { id: 'sound_bay', name: 'Sound Bay' },
          { id: 'la_loma', name: 'La Loma' }
        ]
      },
      {
        id: 'providencia',
        name: 'Providencia',
        barrios: [
          { id: 'santa_isabel', name: 'Santa Isabel' },
          { id: 'aguadulce', name: 'Aguadulce' },
          { id: 'southwest_bay', name: 'Southwest Bay' }
        ]
      }
    ]
  },
  {
    id: 'arauca',
    name: 'Arauca',
    ciudades: [
      {
        id: 'arauca_ciudad',
        name: 'Arauca',
        barrios: [
          { id: 'centro_arauca', name: 'Centro' },
          { id: 'meridiano', name: 'Meridiano' }
        ]
      },
      {
        id: 'saravena',
        name: 'Saravena',
        barrios: [
          { id: 'centro_saravena', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'vichada',
    name: 'Vichada',
    ciudades: [
      {
        id: 'puerto_carreno',
        name: 'Puerto Carreño',
        barrios: [
          { id: 'centro_carreno', name: 'Centro' }
        ]
      }
    ]
  },
  {
    id: 'guainia',
    name: 'Guainía',
    ciudades: [
      {
        id: 'inirida',
        name: 'Inírida',
        barrios: [
          { id: 'centro_inirida', name: 'Centro' },
          { id: 'paujil', name: 'Paujil' }
        ]
      }
    ]
  },
  {
    id: 'guaviare',
    name: 'Guaviare',
    ciudades: [
      {
        id: 'san_jose_guaviare',
        name: 'San José del Guaviare',
        barrios: [
          { id: 'centro_guaviare', name: 'Centro' },
          { id: 'porvenir', name: 'Porvenir' }
        ]
      }
    ]
  },
  {
    id: 'vaupes',
    name: 'Vaupés',
    ciudades: [
      {
        id: 'mitu',
        name: 'Mitú',
        barrios: [
          { id: 'centro_mitu', name: 'Centro' }
        ]
      }
    ]
  }
];

export default COLOMBIA_LOCATIONS;
