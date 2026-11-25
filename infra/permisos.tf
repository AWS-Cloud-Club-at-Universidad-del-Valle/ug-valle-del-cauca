# Bootstrap crea los roles. Este stack conoce los ARN exactos al crear CloudFront.
resource "aws_iam_role_policy" "despliegue_cloudfront" {
  name = "invalidar-cloudfront"
  role = "${var.nombre_proyecto}-github-despliegue"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "cloudfront:CreateInvalidation"
      Resource = aws_cloudfront_distribution.sitio.arn
    }]
  })
}

resource "aws_iam_role_policy" "plan_cloudfront" {
  name = "leer-cloudfront"
  role = "${var.nombre_proyecto}-github-plan"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["cloudfront:GetDistribution", "cloudfront:ListTagsForResource"]
        Resource = aws_cloudfront_distribution.sitio.arn
      },
      {
        Effect   = "Allow"
        Action   = "cloudfront:GetOriginAccessControl"
        Resource = aws_cloudfront_origin_access_control.sitio.arn
      },
      {
        Effect   = "Allow"
        Action   = "cloudfront:GetResponseHeadersPolicy"
        Resource = aws_cloudfront_response_headers_policy.sitio.arn
      },
      {
        Effect   = "Allow"
        Action   = ["cloudfront:DescribeFunction", "cloudfront:GetFunction", "cloudfront:ListTagsForResource"]
        Resource = aws_cloudfront_function.rutas.arn
      },
    ]
  })
}
