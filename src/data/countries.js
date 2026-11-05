// Pays proposés pour les horaires de prière.
// code : ISO 3166 (accepté par l'API Aladhan), method : méthode de calcul officielle du pays,
// cities : [nom envoyé à l'API, nom arabe affiché, paramètres en plus si la ville est ambiguë].
// Les noms des pays sont traduits automatiquement (Intl.DisplayNames).
export const COUNTRIES = [
  { code: 'MA', method: 21, cities: [['Casablanca', 'الدار البيضاء'], ['Rabat', 'الرباط'], ['Fes', 'فاس'], ['Marrakech', 'مراكش'], ['Tangier', 'طنجة'], ['Agadir', 'أكادير'], ['Meknes', 'مكناس'], ['Oujda', 'وجدة'], ['Tetouan', 'تطوان'], ['Kenitra', 'القنيطرة'], ['Laayoune', 'العيون'], ['Dakhla', 'الداخلة']] },
  { code: 'DZ', method: 19, cities: [['Algiers', 'الجزائر'], ['Oran', 'وهران'], ['Constantine', 'قسنطينة'], ['Annaba', 'عنابة'], ['Setif', 'سطيف']] },
  { code: 'TN', method: 18, cities: [['Tunis', 'تونس', { country: 'Tunisia' }], ['Sfax', 'صفاقس'], ['Sousse', 'سوسة'], ['Kairouan', 'القيروان']] },
  { code: 'LY', method: 5, cities: [['Tripoli', 'طرابلس'], ['Benghazi', 'بنغازي'], ['Misrata', 'مصراتة']] },
  { code: 'MR', method: 3, cities: [['Nouakchott', 'نواكشوط'], ['Nouadhibou', 'نواذيبو']] },
  { code: 'EG', method: 5, cities: [['Cairo', 'القاهرة'], ['Alexandria', 'الإسكندرية'], ['Giza', 'الجيزة'], ['Aswan', 'أسوان']] },
  { code: 'SD', method: 5, cities: [['Khartoum', 'الخرطوم'], ['Port Sudan', 'بورتسودان']] },
  { code: 'SA', method: 4, cities: [['Makkah', 'مكة المكرمة'], ['Medina', 'المدينة المنورة'], ['Riyadh', 'الرياض'], ['Jeddah', 'جدة'], ['Dammam', 'الدمام'], ['Taif', 'الطائف']] },
  { code: 'AE', method: 16, cities: [['Dubai', 'دبي'], ['Abu Dhabi', 'أبو ظبي'], ['Sharjah', 'الشارقة']] },
  { code: 'QA', method: 10, cities: [['Doha', 'الدوحة']] },
  { code: 'KW', method: 9, cities: [['Kuwait City', 'مدينة الكويت']] },
  { code: 'BH', method: 8, cities: [['Manama', 'المنامة']] },
  { code: 'OM', method: 8, cities: [['Muscat', 'مسقط'], ['Salalah', 'صلالة']] },
  { code: 'YE', method: 4, cities: [['Sanaa', 'صنعاء'], ['Aden', 'عدن']] },
  { code: 'JO', method: 23, cities: [['Amman', 'عمّان'], ['Irbid', 'إربد'], ['Zarqa', 'الزرقاء']] },
  { code: 'PS', method: 3, cities: [['Jerusalem', 'القدس'], ['Gaza', 'غزة', { state: 'Gaza Strip' }], ['Hebron', 'الخليل'], ['Nablus', 'نابلس']] },
  { code: 'LB', method: 3, cities: [['Beirut', 'بيروت'], ['Tripoli', 'طرابلس']] },
  { code: 'SY', method: 3, cities: [['Damascus', 'دمشق'], ['Aleppo', 'حلب'], ['Homs', 'حمص']] },
  { code: 'IQ', method: 3, cities: [['Baghdad', 'بغداد'], ['Basra', 'البصرة'], ['Mosul', 'الموصل'], ['Erbil', 'أربيل']] },
  { code: 'TR', method: 13, cities: [['Istanbul', 'إسطنبول'], ['Ankara', 'أنقرة'], ['Izmir', 'إزمير'], ['Bursa', 'بورصة']] },
  { code: 'PK', method: 1, cities: [['Karachi', 'كراتشي'], ['Lahore', 'لاهور'], ['Islamabad', 'إسلام آباد']] },
  { code: 'IN', method: 1, cities: [['New Delhi', 'نيودلهي'], ['Mumbai', 'مومباي'], ['Hyderabad', 'حيدر آباد']] },
  { code: 'BD', method: 1, cities: [['Dhaka', 'دكا'], ['Chittagong', 'شيتاغونغ']] },
  { code: 'ID', method: 20, cities: [['Jakarta', 'جاكرتا'], ['Surabaya', 'سورابايا'], ['Bandung', 'باندونغ']] },
  { code: 'MY', method: 17, cities: [['Kuala Lumpur', 'كوالالمبور'], ['Johor Bahru', 'جوهور بهرو']] },
  { code: 'SG', method: 11, cities: [['Singapore', 'سنغافورة']] },
  { code: 'SN', method: 3, cities: [['Dakar', 'داكار'], ['Touba', 'طوبى']] },
  { code: 'NG', method: 3, cities: [['Lagos', 'لاغوس'], ['Kano', 'كانو'], ['Abuja', 'أبوجا']] },
  { code: 'FR', method: 12, cities: [['Paris', 'باريس'], ['Marseille', 'مرسيليا'], ['Lyon', 'ليون'], ['Toulouse', 'تولوز'], ['Lille', 'ليل'], ['Strasbourg', 'ستراسبورغ'], ['Nice', 'نيس'], ['Bordeaux', 'بوردو']] },
  { code: 'BE', method: 3, cities: [['Brussels', 'بروكسل'], ['Antwerp', 'أنتويرب'], ['Liege', 'لييج']] },
  { code: 'NL', method: 3, cities: [['Amsterdam', 'أمستردام'], ['Rotterdam', 'روتردام'], ['The Hague', 'لاهاي']] },
  { code: 'DE', method: 3, cities: [['Berlin', 'برلين'], ['Hamburg', 'هامبورغ'], ['Munich', 'ميونخ'], ['Frankfurt', 'فرانكفورت'], ['Cologne', 'كولونيا']] },
  { code: 'ES', method: 3, cities: [['Madrid', 'مدريد'], ['Barcelona', 'برشلونة'], ['Valencia', 'فالنسيا'], ['Malaga', 'مالقة']] },
  { code: 'IT', method: 3, cities: [['Rome', 'روما'], ['Milan', 'ميلانو'], ['Turin', 'تورينو']] },
  { code: 'PT', method: 22, cities: [['Lisbon', 'لشبونة'], ['Porto', 'بورتو']] },
  { code: 'CH', method: 3, cities: [['Geneva', 'جنيف'], ['Zurich', 'زيورخ']] },
  { code: 'GB', method: 15, cities: [['London', 'لندن'], ['Birmingham', 'برمنغهام'], ['Manchester', 'مانشستر']] },
  { code: 'SE', method: 3, cities: [['Stockholm', 'ستوكهولم'], ['Malmo', 'مالمو']] },
  { code: 'RU', method: 14, cities: [['Moscow', 'موسكو'], ['Kazan', 'قازان']] },
  { code: 'US', method: 2, cities: [['New York', 'نيويورك'], ['Chicago', 'شيكاغو'], ['Los Angeles', 'لوس أنجلوس'], ['Houston', 'هيوستن'], ['Washington', 'واشنطن']] },
  { code: 'CA', method: 2, cities: [['Montreal', 'مونتريال'], ['Toronto', 'تورونتو'], ['Ottawa', 'أوتاوا'], ['Vancouver', 'فانكوفر']] },
];

/** Méthodes de calcul de l'API Aladhan (id -> nom). */
export const METHODS = [
  [21, 'Morocco'], [19, 'Algeria'], [18, 'Tunisia'], [5, 'Egyptian General Authority of Survey'],
  [4, 'Umm Al-Qura, Makkah'], [16, 'Dubai'], [10, 'Qatar'], [9, 'Kuwait'], [8, 'Gulf Region'],
  [23, 'Jordan'], [13, 'Diyanet, Turkey'], [1, 'University of Islamic Sciences, Karachi'],
  [20, 'KEMENAG, Indonesia'], [17, 'JAKIM, Malaysia'], [11, 'MUIS, Singapore'], [3, 'Muslim World League'],
  [12, 'UOIF, France'], [22, 'Lisbon'], [15, 'Moonsighting Committee'], [14, 'Russia'], [2, 'ISNA, North America'],
  [7, 'Tehran'],
];

export const DEFAULT_LOCATION = { type: 'city', country: 'MA', city: 'Casablanca', method: 21 };
