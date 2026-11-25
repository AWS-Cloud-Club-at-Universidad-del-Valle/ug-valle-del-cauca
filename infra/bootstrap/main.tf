data "aws_caller_identity" "actual" {}
data "aws_partition" "actual" {}

locals {
  cuenta       = data.aws_caller_identity.actual.account_id
  particion    = data.aws_partition.actual.partition
  bucket_sitio = "arn:${local.particion}:s3:::${var.nombre_proyecto}-sitio-${local.cuenta}"
  estado       = "${aws_s3_bucket.estado.arn}/sitio/terraform.tfstate"
  oidc_host    = "token.actions.githubusercontent.com"
  oidc_arn     = var.crear_proveedor_oidc ? aws_iam_openid_connect_provider.github[0].arn : data.aws_iam_openid_connect_provider.github[0].arn
  repositorio  = "repo:${var.github_owner}/${var.github_repo}"

  sujetos = {
    despliegue = "${local.repositorio}:ref:refs/heads/main"
    plan       = "${local.repositorio}:pull_request"
  }
}

resource "aws_s3_bucket" "estado" {
  bucket = "${var.nombre_proyecto}-estado-${local.cuenta}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "estado" {
  bucket = aws_s3_bucket.estado.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "estado" {
  bucket = aws_s3_bucket.estado.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "estado" {
  bucket = aws_s3_bucket.estado.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_openid_connect_provider" "github" {
  count          = var.crear_proveedor_oidc ? 1 : 0
  url            = "https://${local.oidc_host}"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_openid_connect_provider" "github" {
  count = var.crear_proveedor_oidc ? 0 : 1
  url   = "https://${local.oidc_host}"
}

resource "aws_iam_role" "github" {
  for_each = local.sujetos
  name     = "${var.nombre_proyecto}-github-${each.key}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = local.oidc_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_host}:aud" = "sts.amazonaws.com"
          "${local.oidc_host}:sub" = each.value
        }
      }
    }]
  })
}

locals {
  listar_estado = {
    Effect   = "Allow"
    Action   = "s3:ListBucket"
    Resource = aws_s3_bucket.estado.arn
    Condition = {
      StringLike = { "s3:prefix" = ["sitio/*", "env:/"] }
    }
  }
}

resource "aws_iam_role_policy" "despliegue" {
  name = "publicar-sitio"
  role = aws_iam_role.github["despliegue"].name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      local.listar_estado,
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = [local.estado, "${local.estado}.tflock"]
      },
      {
        Effect   = "Allow"
        Action   = "s3:DeleteObject"
        Resource = "${local.estado}.tflock"
      },
      {
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = local.bucket_sitio
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:AbortMultipartUpload"]
        Resource = "${local.bucket_sitio}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "plan" {
  name = "leer-infraestructura"
  role = aws_iam_role.github["plan"].name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      local.listar_estado,
      {
        Effect   = "Allow"
        Action   = "s3:GetObject"
        Resource = local.estado
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetAccelerateConfiguration",
          "s3:GetBucketAcl",
          "s3:GetBucketCORS",
          "s3:GetBucketLocation",
          "s3:GetBucketLogging",
          "s3:GetBucketObjectLockConfiguration",
          "s3:GetBucketOwnershipControls",
          "s3:GetBucketPolicy",
          "s3:GetBucketPublicAccessBlock",
          "s3:GetBucketRequestPayment",
          "s3:GetBucketTagging",
          "s3:GetBucketVersioning",
          "s3:GetBucketWebsite",
          "s3:GetEncryptionConfiguration",
          "s3:GetLifecycleConfiguration",
          "s3:GetReplicationConfiguration",
          "s3:ListTagsForResource",
        ]
        Resource = local.bucket_sitio
      },
      {
        Effect = "Allow"
        Action = "iam:GetRolePolicy"
        Resource = [
          aws_iam_role.github["despliegue"].arn,
          aws_iam_role.github["plan"].arn,
        ]
      }
    ]
  })
}
