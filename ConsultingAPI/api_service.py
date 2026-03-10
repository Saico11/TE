import requests
import os
from dotenv import load_dotenv
from modelos import RUC, DNI

load_dotenv()
TOKEN = os.getenv("API_TOKEN")
BASE_URL = os.getenv("API_BASE_URL")
HEADERS = {
    "Accept": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

def consultar_ruc(numero: str) -> RUC:
    numero = numero.strip()
    if not numero.isdigit() or len(numero) != 11:
        raise ValueError("El RUC debe tener exactamente 11 dígitos.")
    
    try:
        r = requests.get(f"{BASE_URL}/ruc?numero={numero}", headers=HEADERS, timeout=10)
        r.raise_for_status()
        return RUC.desde_dict(r.json())
    except requests.exceptions.Timeout:
        raise ConnectionError("El servicio no respondió. Intente nuevamente.")
    except requests.exceptions.HTTPError:
        if r.status_code == 401: raise PermissionError("Token inválido o expirado.")
        if r.status_code == 404: raise LookupError("RUC no encontrado.")
        raise RuntimeError("Error del servidor.")
    except requests.exceptions.ConnectionError:
        raise ConnectionError("Sin conexión a internet.")

def consultar_dni(numero: str) -> DNI:
    numero = numero.strip()
    if not numero.isdigit() or len(numero) != 8:
        raise ValueError("El DNI debe tener exactamente 8 dígitos.")
    
    try:
        r = requests.get(f"{BASE_URL}/dni?numero={numero}", headers=HEADERS, timeout=10)
        r.raise_for_status()
        return DNI.desde_dict(r.json())
    except requests.exceptions.Timeout:
        raise ConnectionError("El servicio no respondió. Intente nuevamente.")
    except requests.exceptions.HTTPError:
        if r.status_code == 401: raise PermissionError("Token inválido o expirado.")
        if r.status_code == 404: raise LookupError("DNI no encontrado.")
        raise RuntimeError("Error del servidor.")
    except requests.exceptions.ConnectionError:
        raise ConnectionError("Sin conexión a internet.")
