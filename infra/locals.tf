locals {
  public_subnet_config = {
    "public_1"  = { cidr_block = "10.0.1.0/24",  az = data.aws_availability_zones.az.names[0] }
    "public_2"  = { cidr_block = "10.0.2.0/24",  az = data.aws_availability_zones.az.names[1] }
  }
  private_subnet_config = {
    "private_1" = { cidr_block = "10.0.11.0/24", az = data.aws_availability_zones.az.names[0] }
    "private_2" = { cidr_block = "10.0.12.0/24", az = data.aws_availability_zones.az.names[1] }
  }
  db_subnet_config = {
    "private_1" = { cidr_block = "10.0.21.0/24", az = data.aws_availability_zones.az.names[0] }
    "private_2" = { cidr_block = "10.0.22.0/24", az = data.aws_availability_zones.az.names[1] }
  }
}