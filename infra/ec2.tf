resource "aws_instance" "client" {
  ami = data.aws_ami.latest_amazon_linux.id
  subnet_id = aws_subnet.private["private_1"].id
  vpc_security_group_ids = [aws_security_group.client.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  instance_type = "t3.micro"
  user_data = file("${path.module}/user_data.sh")
  tags = {
    Name = "${var.name}-ec2-client"
  }
}

resource "aws_instance" "server" {
  ami = data.aws_ami.latest_amazon_linux.id
  subnet_id = aws_subnet.private["private_2"].id
  user_data = file("${path.module}/user_data.sh")
  vpc_security_group_ids = [aws_security_group.server.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  instance_type = "t3.micro"
  tags = {
    Name = "${var.name}-ec2-server"
  }
}