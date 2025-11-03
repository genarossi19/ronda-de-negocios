export interface CompanyType {
  id: number;
  name: string;
  sector: string;
  logo: string;
}

export interface CompanyDetail extends CompanyType {
  description: string;
  email: string;
  contactName: string;
  phone: string;
}
