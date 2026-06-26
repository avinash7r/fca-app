variable "name" {
  type    = string
  default = "fca"
}

variable "env" {
  type    = string
  default = "staging"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}
