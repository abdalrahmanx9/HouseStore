output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR"
  value       = module.vpc.vpc_cidr_block
}

output "eks_cluster_endpoint" {
  description = "EKS Cluster Endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_name" {
  description = "EKS Cluster Name"
  value       = module.eks.cluster_name
}

output "rds_endpoint" {
  description = "RDS Endpoint"
  value       = aws_db_instance.this.endpoint
}

output "rds_port" {
  description = "RDS Port"
  value       = aws_db_instance.this.port
}

output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.this.dns_name
}

output "alb_zone_id" {
  description = "ALB Zone ID"
  value       = aws_lb.this.zone_id
}