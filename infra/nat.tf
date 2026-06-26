resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
    Name = "${var.name}-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public["public_1"].id
  tags = {
    Name = "${var.name}-nat"
  }
}
