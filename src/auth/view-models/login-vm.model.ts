import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class LoginVm {
  @IsEmail({}, { message: 'Email is invalid' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @ApiProperty()
  password: string;

  @ApiPropertyOptional()
  clientId?: string;
}
