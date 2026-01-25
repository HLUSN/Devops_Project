variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "myapp"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access (contents of your .pub file)"
  type        = string
}
