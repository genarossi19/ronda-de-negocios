export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserWrite {
  email: string;
  nombre_contacto: string;
  apellido_contacto: string;
  password: string;
  password2: string;
  razon_social: string;
  cuit: string;
  email_empresa: string;
  telefono_contacto: string;
  descripcion: string;
  direccion: string;
  logo: string | null;
  localidad: number;
  sector: number;
}

export interface UserLogin {
  email: string;
  password: string;
}
