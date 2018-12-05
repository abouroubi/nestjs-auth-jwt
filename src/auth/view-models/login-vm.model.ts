import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class LoginVm {
  @IsEmail({}, { message: 'Email is invalid' })
  @ApiModelProperty()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @ApiModelProperty()
  password: string;

  @ApiModelPropertyOptional()
  clientId?: string;
}
