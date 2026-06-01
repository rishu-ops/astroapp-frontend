export interface PanchangElementDetail {
  name: string;
  number?: number;
  ruler?: string;
  deity: string;
  summary: string;
  endTime: string;
}

export interface PanchangYogDetail {
  name: string;
  meaning: string;
  special: string;
  endTime: string;
}

export interface PanchangKaranDetail {
  name: string;
  deity: string;
  special: string;
  endTime: string;
}

export interface TimeRangeDetail {
  startTime: string;
  endTime: string;
}

export interface PanchangResponse {
  day: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;

  tithi: PanchangElementDetail;
  nakshatra: PanchangElementDetail;
  yog: PanchangYogDetail;
  karan: PanchangKaranDetail;

  paksha: string;
  ritu: string;
  sunSign: string;
  moonSign: string;

  abhijitMuhurta: TimeRangeDetail;
  rahukaal: TimeRangeDetail;
  gulikaal: TimeRangeDetail;
  yamghantKaal: TimeRangeDetail;
}

export interface PanchangPreference {
  userId?: string;
  latitude: number;
  longitude: number;
  timezone: number;
  cityName: string;
}

export interface PanchangAnalyticsLog {
  date: string;
  count: number;
}

export interface PanchangAnalyticsCityLog {
  cityName: string;
  count: number;
}

export interface PanchangAdminAnalytics {
  totalViews: number;
  topDates: PanchangAnalyticsLog[];
  topCities: PanchangAnalyticsCityLog[];
  dailyTrends: PanchangAnalyticsLog[];
}
