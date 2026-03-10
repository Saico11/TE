import tkinter as tk
from tkinter import messagebox
from api_service import consultar_ruc, consultar_dni

def buscar_ruc():
    text_rpta_ruc.config(state="normal")
    text_rpta_ruc.delete("1.0", tk.END)
    try:
        res = consultar_ruc(entry_ruc.get())
        info = (f"Nombre: {res.nombre}\n"
                f"Estado: {res.estado}\n"
                f"Condición: {res.condicion}\n"
                f"Dirección: {res.direccion}\n"
                f"Distrito: {res.distrito}\n"
                f"Departamento: {res.departamento}")
        text_rpta_ruc.insert(tk.END, info)
    except (ValueError, LookupError) as e:
        messagebox.showwarning("Dato inválido", str(e))
    except (ConnectionError, PermissionError, RuntimeError) as e:
        messagebox.showerror("Error", str(e))
    finally:
        text_rpta_ruc.config(state="disabled")

def buscar_dni():
    text_rpta_dni.config(state="normal")
    text_rpta_dni.delete("1.0", tk.END)
    try:
        res = consultar_dni(entry_dni.get())
        info = (f"Nombre: {res.nombre}\n"
                f"Nombres: {res.nombres}\n"
                f"Apellidos: {res.apellidoPaterno} {res.apellidoMaterno}\n"
                f"N° Documento: {res.numeroDocumento}")
        text_rpta_dni.insert(tk.END, info)
    except (ValueError, LookupError) as e:
        messagebox.showwarning("Dato inválido", str(e))
    except (ConnectionError, PermissionError, RuntimeError) as e:
        messagebox.showerror("Error", str(e))
    finally:
        text_rpta_dni.config(state="disabled")

# Configuración de Ventana Principal
ventana = tk.Tk()
ventana.title("Consulta API DNI y RUC")
ventana.geometry("500x450")
ventana.resizable(False, False)

# Sección RUC
fr = tk.LabelFrame(ventana, text="Consulta RUC", padx=10, pady=10)
fr.pack(fill="x", padx=15, pady=10)
tk.Label(fr, text="Número RUC:").grid(row=0, column=0, sticky="w")
entry_ruc = tk.Entry(fr, width=20)
entry_ruc.grid(row=0, column=1, padx=5)
tk.Button(fr, text="Buscar", command=buscar_ruc).grid(row=0, column=2)
text_rpta_ruc = tk.Text(fr, height=5, width=55, state="disabled", bg="#f0f0f0")
text_rpta_ruc.grid(row=1, column=0, columnspan=3, pady=5)

# Sección DNI
fd = tk.LabelFrame(ventana, text="Consulta DNI", padx=10, pady=10)
fd.pack(fill="x", padx=15, pady=10)
tk.Label(fd, text="Número DNI:").grid(row=0, column=0, sticky="w")
entry_dni = tk.Entry(fd, width=20)
entry_dni.grid(row=0, column=1, padx=5)
tk.Button(fd, text="Buscar", command=buscar_dni).grid(row=0, column=2)
text_rpta_dni = tk.Text(fd, height=5, width=55, state="disabled", bg="#f0f0f0")
text_rpta_dni.grid(row=1, column=0, columnspan=3, pady=5)

ventana.mainloop()
