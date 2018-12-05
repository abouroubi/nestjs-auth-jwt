import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export class LoginResponseVm {
  @ApiModelProperty() accessToken: string;
  @ApiModelProperty({ default: 'bearer' }) tokenType: string = 'bearer';
  @ApiModelProperty() expiresIn: number;
  @ApiModelPropertyOptional() refreshToken?: string;
}
