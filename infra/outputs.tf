output "client_instance_id" {
  value = aws_instance.client.id
}

output "server_instance_id" {
  value = aws_instance.server.id
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

output "server_private_ip" {
  value = aws_instance.server.private_ip
}

output "ecr_client_url" {
  value = aws_ecr_repository.client.repository_url
}

output "ecr_server_url" {
  value = aws_ecr_repository.server.repository_url
}

output "alb_dns" {
  value = aws_lb.main.dns_name
}