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

variable "dominio" {
  description = "Dominio personalizado opcional. Requiere un certificado ACM en us-east-1."
  type        = string
  default     = null

  validation {
    condition     = (var.dominio == null) == (var.certificado_acm_arn == null)
    error_message = "Configura dominio y certificado_acm_arn juntos o deja ambos en null."
  }
}

variable "certificado_acm_arn" {
  description = "ARN de un certificado ACM emitido en us-east-1 que cubra el dominio."
  type        = string
  default     = null

  validation {
    condition     = var.certificado_acm_arn == null || can(regex("^arn:[^:]+:acm:us-east-1:[0-9]{12}:certificate/.+$", var.certificado_acm_arn))
    error_message = "Usa el ARN de un certificado ACM de us-east-1."
  }
}
