export interface User {
  id: number;
  email: string;
  password: string; // za sada običan tekst, kasnije hash
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  favoriteTypes: string[];
}