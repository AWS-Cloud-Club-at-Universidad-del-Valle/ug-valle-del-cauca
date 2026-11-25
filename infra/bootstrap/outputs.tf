output "bucket_estado" {
  value = aws_s3_bucket.estado.id
}

output "rol_despliegue_arn" {
  value = aws_iam_role.github["despliegue"].arn
}

output "rol_plan_arn" {
  value = aws_iam_role.github["plan"].arn
}
