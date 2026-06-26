output "client_instance_id" {
  value = aws_instance.client.id
}

output "server_instance_id" {
  value = aws_instance.server.id
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

output "ecr_client_register" {
  value = aws_ecr_repository.client.repository_url
}

output "ecr_server_register" {
  value = aws_ecr_repository.server.repository_url
}

output "client_ecr_repository" {
  value = aws_ecr_repository.client.name
}

output "server_ecr_repository" {
  value = aws_ecr_repository.server.name
}