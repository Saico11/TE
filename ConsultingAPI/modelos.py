from dataclasses import dataclass

@dataclass
class RUC:
    nombre: str = ""
    estado: str = ""
    condicion: str = ""
    direccion: str = ""
    distrito: str = ""
    provincia: str = ""
    departamento: str = ""

    @classmethod
    def desde_dict(cls, data: dict) -> "RUC":
        return cls(
            nombre=data.get("nombre", ""),
            estado=data.get("estado", ""),
            condicion=data.get("condicion", ""),
            direccion=data.get("direccion", ""),
            distrito=data.get("distrito", ""),
            provincia=data.get("provincia", ""),
            departamento=data.get("departamento", "")
        )

@dataclass
class DNI:
    nombre: str = ""
    nombres: str = ""
    apellidoPaterno: str = ""
    apellidoMaterno: str = ""
    numeroDocumento: str = ""

    @classmethod
    def desde_dict(cls, data: dict) -> "DNI":
        return cls(
            nombre=data.get("nombre", ""),
            nombres=data.get("nombres", ""),
            apellidoPaterno=data.get("apellidoPaterno", ""),
            apellidoMaterno=data.get("apellidoMaterno", ""),
            numeroDocumento=data.get("numeroDocumento", "")
        )
