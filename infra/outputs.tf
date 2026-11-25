output "bucket_sitio" {
  value = aws_s3_bucket.sitio.id
}

output "distribucion_id" {
  value = aws_cloudfront_distribution.sitio.id
}

output "url_sitio" {
  value = "https://${aws_cloudfront_distribution.sitio.domain_name}"
}
