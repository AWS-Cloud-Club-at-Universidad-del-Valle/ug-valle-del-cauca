data "aws_caller_identity" "actual" {}

resource "aws_s3_bucket" "sitio" {
  bucket = "${var.nombre_proyecto}-sitio-${data.aws_caller_identity.actual.account_id}"
}

resource "aws_s3_bucket_ownership_controls" "sitio" {
  bucket = aws_s3_bucket.sitio.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "sitio" {
  bucket = aws_s3_bucket.sitio.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sitio" {
  bucket = aws_s3_bucket.sitio.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_cloudfront_origin_access_control" "sitio" {
  name                              = "${var.nombre_proyecto}-s3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "rutas" {
  name    = "${var.nombre_proyecto}-rutas"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/rutas.js")
}

resource "aws_cloudfront_response_headers_policy" "sitio" {
  name = "${var.nombre_proyecto}-seguridad"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      override                   = true
    }

    content_type_options {
      override = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    content_security_policy {
      # El script en línea se publica con el build de Astro, independiente de Terraform.
      # Se permite código en línea para evitar fijar un hash que quedaría desactualizado al editar el script.
      content_security_policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://secure.meetupstatic.com https://secure-content.meetupstatic.com; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'"
      override                = true
    }
  }
}

resource "aws_cloudfront_distribution" "sitio" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = "PriceClass_100"
  aliases             = var.dominio == null ? [] : [var.dominio]

  origin {
    domain_name              = aws_s3_bucket.sitio.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.sitio.id
    origin_access_control_id = aws_cloudfront_origin_access_control.sitio.id
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = aws_s3_bucket.sitio.id
    viewer_protocol_policy     = "redirect-to-https"
    compress                   = true
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    response_headers_policy_id = aws_cloudfront_response_headers_policy.sitio.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rutas.arn
    }
  }

  # S3 privado devuelve 403 para claves inexistentes cuando CloudFront carece de ListBucket.
  dynamic "custom_error_response" {
    for_each = [403, 404]
    content {
      error_code            = custom_error_response.value
      response_code         = 404
      response_page_path    = "/404.html"
      error_caching_min_ttl = 0
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = var.certificado_acm_arn == null
    acm_certificate_arn            = var.certificado_acm_arn
    ssl_support_method             = var.certificado_acm_arn == null ? null : "sni-only"
    minimum_protocol_version       = var.certificado_acm_arn == null ? null : "TLSv1.2_2021"
  }
}

resource "aws_s3_bucket_policy" "sitio" {
  bucket = aws_s3_bucket_public_access_block.sitio.bucket
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.sitio.arn}/*"
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.sitio.arn }
      }
    }]
  })
}
