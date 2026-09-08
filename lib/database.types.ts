export type EstadoPedido = "pendiente" | "entregado" | "cancelado";
export type TipoEntrega  = "domicilio" | "presencial";

export type Pedido = {
  id:            string;
  created_at:    string;
  cliente:       string;
  telefono:      string | null;
  marca:         string;
  referencia:    string;
  tipo_entrega:  TipoEntrega;
  direccion:     string | null;
  precio_venta:  number;
  estado:        EstadoPedido;
  vendedor:      string | null;
  notas:         string | null;
};

export type Database = {
  public: {
    Tables: {
      pedidos: {
        Row: {
          id:            string;
          created_at:    string;
          cliente:       string;
          telefono:      string | null;
          marca:         string;
          referencia:    string;
          tipo_entrega:  TipoEntrega;
          direccion:     string | null;
          precio_venta:  number;
          estado:        EstadoPedido;
          vendedor:      string | null;
          notas:         string | null;
        };
        Insert: {
          id?:           string | undefined;
          created_at?:   string | undefined;
          cliente:       string;
          telefono?:     string | null | undefined;
          marca:         string;
          referencia:    string;
          tipo_entrega:  TipoEntrega;
          direccion?:    string | null | undefined;
          precio_venta:  number;
          estado?:       EstadoPedido | undefined;
          vendedor?:     string | null | undefined;
          notas?:        string | null | undefined;
        };
        Update: {
          id?:           string | undefined;
          created_at?:   string | undefined;
          cliente?:      string | undefined;
          telefono?:     string | null | undefined;
          marca?:        string | undefined;
          referencia?:   string | undefined;
          tipo_entrega?: TipoEntrega | undefined;
          direccion?:    string | null | undefined;
          precio_venta?: number | undefined;
          estado?:       EstadoPedido | undefined;
          vendedor?:     string | null | undefined;
          notas?:        string | null | undefined;
        };
        Relationships: [];
      };
    };
    Views:          Record<string, never>;
    Functions:      Record<string, never>;
    Enums:          Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
