export type EstadoPedido = "pendiente" | "entregado" | "cancelado";
export type TipoEntrega  = "domicilio" | "presencial";

export interface Pedido {
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
}

export interface Database {
  public: {
    Tables: {
      pedidos: {
        Row:    Pedido;
        Insert: Omit<Pedido, "id" | "created_at">;
        Update: Partial<Omit<Pedido, "id" | "created_at">>;
      };
    };
  };
}
