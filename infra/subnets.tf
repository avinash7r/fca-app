resource "aws_subnet" "public" {
  for_each          = local.public_subnet_config
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr_block
  availability_zone = each.value.az
}

resource "aws_subnet" "private" {
  for_each          = local.private_subnet_config
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr_block
  availability_zone = each.value.az
}

resource "aws_subnet" "db" {
  for_each          = local.db_subnet_config
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr_block
  availability_zone = each.value.az
}
