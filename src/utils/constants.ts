import { LOCALITY } from '@domain/entities/user';

export const REGEX_BSON_ID = '[0-9a-fA-F]{24}';

export const priceLocalityFactor = {
  [LOCALITY.ASIA]: 0.95,
  [LOCALITY.EUROPE]: 1.15,
  [LOCALITY.US]: 1,
};

export const POLISH_BANK_HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's day",
  '01-06': 'Epiphany',
  '04-20': 'Easter Sunday',
  '04-21': 'Easter Monday',
  '05-01': 'Labour Day',
  '05-03': 'Constitution Day',
  '06-08': 'Whit Sunday',
  '06-19': 'Corpus Christi',
  '08-15': 'Assumption Day',
  '11-01': "All Saint's Day",
  '11-11': 'Independence Day',
  '12-25': 'Christmas Day',
  '12-26': 'Second Day of Christmas',
};

export const BLACK_FRIDAY_DATE = '11-28';
