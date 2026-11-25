variable "region" {
  description = "Región de los buckets del proyecto."
  type        = string
  default     = "us-east-1"
}

variable "nombre_proyecto" {
  description = "Prefijo de los recursos en AWS."
  type        = string
  default     = "awsug-valle"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,39}$", var.nombre_proyecto))
    error_message = "Usa hasta 40 caracteres en minúscula, con letras, números o guiones. Empieza con una letra."
  }
}

variable "github_owner" {
  description = "Dueño del repositorio en GitHub. Se configura también en bootstrap para la confianza OIDC."
  type        = string
  default     = "AWS-Cloud-Club-at-Universidad-del-Valle"
}

variable "github_repo" {
  description = "Nombre del repositorio en GitHub. Se configura también en bootstrap para la confianza OIDC."
  type        = string
  default     = "ug-valle-del-cauca"
}

variable "tags" {
  description = "Etiquetas adicionales para los recursos que las admiten."
  type        = map(string)
  default     = {}
}

variable "crear_proveedor_oidc" {
  description = "Crea el proveedor OIDC de GitHub. Usa false si ya existe en la cuenta."
  type        = bool
  default     = true
}
